using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Application.Requests.Commands.MarkRequestRiskAlertSent;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using MediatR;

namespace ErrandsManagement.Application.Requests.Handlers;

/// <summary>
/// Handles RequestAtRiskEvent:
///   1. Fetches Admin user IDs
///   2. Creates notifications for Admin(s), Requester (Collaborator), and Courier (if assigned)
///   3. Persists each notification and fires NotificationCreatedEvent for SignalR push
///   4. Stamps the request as alerted via MarkRequestRiskAlertSentCommand
/// </summary>
public sealed class RequestAtRiskHandler : INotificationHandler<RequestAtRiskEvent>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMediator _mediator;

    public RequestAtRiskHandler(
        INotificationRepository notificationRepository,
        IUserRepository userRepository,
        IMediator mediator)
    {
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
        _mediator = mediator;
    }

    public async Task Handle(RequestAtRiskEvent evt, CancellationToken cancellationToken)
    {
        var message = $"Request \"{evt.Title}\" is at risk of missing its deadline on "
                    + $"{evt.Deadline:yyyy-MM-dd HH:mm} UTC.";

        // ── 1. Collect recipient IDs ─────────────────────────────────────
        var recipientIds = new List<Guid>();

        var admins = await _userRepository.GetByRoleAsync(UserRole.Admin, cancellationToken);
        recipientIds.AddRange(admins.Select(a => a.Id));

        // Requester (Collaborator role user who owns the request)
        recipientIds.Add(evt.RequesterId);

        // Assigned courier (optional)
        if (evt.AssignedCourierId.HasValue)
            recipientIds.Add(evt.AssignedCourierId.Value);

        // Deduplicate (admin may coincidentally be the requester in edge cases)
        var uniqueRecipients = recipientIds.Distinct();

        // ── 2. Persist & push each notification ──────────────────────────
        foreach (var userId in uniqueRecipients)
        {
            var metadata = System.Text.Json.JsonSerializer.Serialize(new
            {
                deadlineUtc = evt.Deadline.ToString("O")
            });

            var notification = Notification.Create(
                userId: userId,
                message: $"Request \"{evt.Title}\" is at risk of missing its deadline.",
                type: NotificationType.DeadlineRisk,
                referenceId: evt.RequestId,
                metadata: metadata);

            await _notificationRepository.AddAsync(notification, cancellationToken);
            await _notificationRepository.SaveChangesAsync(cancellationToken);

            // Triggers SignalR push via SendRealtimeOnNotificationCreated
            await _mediator.Publish(
                new NotificationCreatedEvent(notification),
                cancellationToken);
        }

        // ── 3. Stamp idempotency flag ─────────────────────────────────────
        await _mediator.Send(
            new MarkRequestRiskAlertSentCommand(evt.RequestId),
            cancellationToken);
    }
}