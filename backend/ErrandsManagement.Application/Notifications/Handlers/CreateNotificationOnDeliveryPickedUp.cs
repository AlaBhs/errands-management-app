using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Handlers;

/// <summary>
/// Listens to DeliveryBatchPickedUpEvent.
/// Notifies all Admin users that a batch has been picked up.
/// Real-time delivery handled by SendRealtimeOnNotificationCreated.
/// </summary>
public sealed class CreateNotificationOnDeliveryPickedUp
    : INotificationHandler<DeliveryBatchPickedUpEvent>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMediator _mediator;

    public CreateNotificationOnDeliveryPickedUp(
        INotificationRepository notificationRepository,
        IUserRepository userRepository,
        IMediator mediator)
    {
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
        _mediator = mediator;
    }

    public async Task Handle(
        DeliveryBatchPickedUpEvent notification,
        CancellationToken cancellationToken)
    {
        var admins = await _userRepository
            .GetByRoleAsync(UserRole.Admin, cancellationToken);

        if (!admins.Any())
            return;

        var notifications = admins
            .Select(admin => Notification.Create(
                userId: admin.Id,
                message: $"Delivery '{notification.BatchTitle}' (Client: {notification.ClientName}) has been picked up.",
                type: NotificationType.DeliveryPickedUp,
                referenceId: notification.BatchId))
            .ToList();

        foreach (var entity in notifications)
            await _notificationRepository.AddAsync(entity, cancellationToken);

        await _notificationRepository.SaveChangesAsync(cancellationToken);

        foreach (var entity in notifications)
            await _mediator.Publish(new NotificationCreatedEvent(entity), cancellationToken);
    }
}