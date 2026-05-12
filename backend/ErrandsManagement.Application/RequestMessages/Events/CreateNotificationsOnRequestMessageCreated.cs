using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using MediatR;

namespace ErrandsManagement.Application.RequestMessages.Events;

/// <summary>
/// Step 1 of the messaging notification pipeline.
///
/// Listens to <see cref="RequestMessageCreatedEvent"/>, determines which
/// participants should be notified (everyone EXCEPT the sender), persists
/// one <see cref="Notification"/> per recipient, then publishes a
/// <see cref="NotificationCreatedEvent"/> for each so the existing
/// real-time handler (<c>SendRealtimeOnNotificationCreated</c>) picks them up.
///
/// Recipient rules:
///   - Collaborator sends  → notify Admin(s) + Courier (if assigned)
///   - Courier sends       → notify Admin(s) + Collaborator
///   - Admin sends         → notify Collaborator + Courier (if assigned)
/// </summary>
public sealed class CreateNotificationsOnRequestMessageCreated
    : INotificationHandler<RequestMessageCreatedEvent>
{
    private readonly IRequestRepository _requestRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IMediator _mediator;

    public CreateNotificationsOnRequestMessageCreated(
        IRequestRepository requestRepository,
        IUserRepository userRepository,
        INotificationRepository notificationRepository,
        IMediator mediator)
    {
        _requestRepository = requestRepository;
        _userRepository = userRepository;
        _notificationRepository = notificationRepository;
        _mediator = mediator;
    }

    public async Task Handle(
        RequestMessageCreatedEvent notification,
        CancellationToken cancellationToken)
    {
        // Load request (with Assignments navigation)
        var request = await _requestRepository.GetByIdAsync(
            notification.RequestId, cancellationToken);

        if (request is null)
            return; // defensive: request deleted between event raise and handler

        // Resolve sender role
        var sender = await _userRepository.FindByIdAsync(
            notification.SenderId, cancellationToken);

        if (sender is null)
            return;

        var senderRole = sender.Roles.FirstOrDefault() ?? string.Empty;

        // Collect recipient IDs (everyone except sender)
        var recipientIds = new HashSet<Guid>();

        // Always include the Collaborator (request owner) unless they are the sender
        if (request.RequesterId != notification.SenderId)
            recipientIds.Add(request.RequesterId);

        // Include assigned courier (if any, and not the sender)
        var activeCourierId = request.Assignments
            .FirstOrDefault(a => a.IsActive)?.CourierId;

        if (activeCourierId.HasValue && activeCourierId.Value != notification.SenderId)
            recipientIds.Add(activeCourierId.Value);

        // Include all Admins unless the sender IS an Admin
        if (!string.Equals(senderRole, UserRole.Admin.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            var admins = await _userRepository.GetByRoleAsync(
                UserRole.Admin, cancellationToken);

            foreach (var admin in admins)
                recipientIds.Add(admin.Id);

            // Remove sender just in case sender is also in the admin list
            recipientIds.Remove(notification.SenderId);
        }

        if (recipientIds.Count == 0)
            return;

        // Build notification message
        var notificationMessage =
            $"{sender.FullName} sent a message on request \"{request.Title}\": " +
            $"\"{TruncateContent(notification.Content)}\"";

        // Persist one notification per recipient and trigger realtime push for each
        foreach (var recipientId in recipientIds)
        {
            var entity = Notification.Create(
                userId: recipientId,
                message: notificationMessage,
                type: NotificationType.NewMessageReceived,
                referenceId: notification.RequestId);

            await _notificationRepository.AddAsync(entity, cancellationToken);
            await _notificationRepository.SaveChangesAsync(cancellationToken);

            // Reuse the existing SendRealtimeOnNotificationCreated handler
            await _mediator.Publish(new NotificationCreatedEvent(entity), cancellationToken);
        }
    }

    private static string TruncateContent(string content, int maxLength = 60)
        => content.Length <= maxLength
            ? content
            : string.Concat(content.AsSpan(0, maxLength), "…");
}
