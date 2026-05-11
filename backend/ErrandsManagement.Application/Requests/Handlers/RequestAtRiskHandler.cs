using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Application.Notifications.Helpers;
using ErrandsManagement.Application.Requests.Commands.MarkRequestRiskAlertSent;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using MediatR;

namespace ErrandsManagement.Application.Requests.Handlers;

/// <summary>
/// Handles RequestAtRiskEvent:
///   1. Builds a recipient list: all admins + requester + assigned courier (if any)
///   2. Deduplicates by UserId (in case requester or courier is also an admin)
///   3. Runs two-level gate per recipient — skip if either gate blocks
///   4. Creates, persists, and pushes a notification for each passing recipient
///   5. Stamps the request as alerted to prevent duplicate alerts
/// </summary>
public sealed class RequestAtRiskHandler : INotificationHandler<RequestAtRiskEvent>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISystemConfigReader _configReader;
    private readonly IUserPreferencesRepository _prefsRepo;
    private readonly IMediator _mediator;

    public RequestAtRiskHandler(
        INotificationRepository notificationRepository,
        IUserRepository userRepository,
        ISystemConfigReader configReader,
        IUserPreferencesRepository prefsRepo,
        IMediator mediator)
    {
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
        _configReader = configReader;
        _prefsRepo = prefsRepo;
        _mediator = mediator;
    }

    public async Task Handle(RequestAtRiskEvent evt, CancellationToken cancellationToken)
    {
        // ── 1. Build recipient list with their roles ──────────────────────
        var recipients = new List<(Guid UserId, UserRole Role)>();

        var admins = await _userRepository.GetByRoleAsync(UserRole.Admin, cancellationToken);
        recipients.AddRange(admins.Select(a => (a.Id, UserRole.Admin)));

        recipients.Add((evt.RequesterId, UserRole.Collaborator));

        if (evt.AssignedCourierId.HasValue)
            recipients.Add((evt.AssignedCourierId.Value, UserRole.Courier));

        // ── 2. Deduplicate by UserId ──────────────────────────────────────
        var seen = new HashSet<Guid>();
        var uniqueRecipients = recipients.Where(r => seen.Add(r.UserId)).ToList();

        // ── 3. Gate check + persist per recipient ─────────────────────────
        var metadata = System.Text.Json.JsonSerializer.Serialize(new
        {
            deadlineUtc = evt.Deadline.ToString("O")
        });

        foreach (var (userId, role) in uniqueRecipients)
        {
            if (!await NotificationGate.IsAllowedAsync(
                    userId, role,
                    NotificationType.DeadlineRisk,
                    _configReader, _prefsRepo, cancellationToken))
                continue;

            var notification = Notification.Create(
                userId: userId,
                message: $"Request \"{evt.Title}\" is at risk of missing its deadline.",
                type: NotificationType.DeadlineRisk,
                referenceId: evt.RequestId,
                metadata: metadata);

            await _notificationRepository.AddAsync(notification, cancellationToken);
            await _notificationRepository.SaveChangesAsync(cancellationToken);
            await _mediator.Publish(
                new NotificationCreatedEvent(notification), cancellationToken);
        }

        // ── 4. Stamp idempotency flag ─────────────────────────────────────
        await _mediator.Send(
            new MarkRequestRiskAlertSentCommand(evt.RequestId), cancellationToken);
    }
}