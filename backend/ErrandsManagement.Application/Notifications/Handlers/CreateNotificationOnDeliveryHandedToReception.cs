using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Handlers;

/// <summary>
/// Listens to DeliveryBatchHandedToReceptionEvent.
/// Persists one notification per Reception user.
/// Real-time delivery is handled by the existing
/// SendRealtimeOnNotificationCreated handler.
/// </summary>
public sealed class CreateNotificationOnDeliveryHandedToReception
    : INotificationHandler<DeliveryBatchHandedToReceptionEvent>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMediator _mediator;

    public CreateNotificationOnDeliveryHandedToReception(
        INotificationRepository notificationRepository,
        IUserRepository userRepository,
        IMediator mediator)
    {
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
        _mediator = mediator;
    }

    public async Task Handle(
        DeliveryBatchHandedToReceptionEvent notification,
        CancellationToken cancellationToken)
    {
        var receptionUsers = await _userRepository
            .GetByRoleAsync(UserRole.Reception, cancellationToken);

        if (!receptionUsers.Any())
            return;

        var notifications = receptionUsers
            .Select(user => Notification.Create(
                userId: user.Id,
                message: $"New delivery ready for pickup: '{notification.BatchTitle}' (Client: {notification.ClientName}).",
                type: NotificationType.DeliveryHandedToReception,
                referenceId: notification.BatchId))
            .ToList();

        foreach (var entity in notifications)
            await _notificationRepository.AddAsync(entity, cancellationToken);

        await _notificationRepository.SaveChangesAsync(cancellationToken);

        // Fire a NotificationCreatedEvent per notification —
        // SendRealtimeOnNotificationCreated delivers each via SignalR.
        foreach (var entity in notifications)
            await _mediator.Publish(new NotificationCreatedEvent(entity), cancellationToken);
    }
}