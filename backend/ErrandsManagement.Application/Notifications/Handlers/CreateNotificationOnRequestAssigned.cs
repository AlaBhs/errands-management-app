using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Handlers;

/// <summary>
/// Listens to RequestAssignedEvent, persists the notification.
/// Does NOT send it — that is SendRealtimeOnNotificationCreated's responsibility.
/// </summary>
public sealed class CreateNotificationOnRequestAssigned
    : INotificationHandler<RequestAssignedEvent>
{
    private readonly INotificationRepository _repository;
    private readonly IMediator _mediator;

    public CreateNotificationOnRequestAssigned(
        INotificationRepository repository,
        IMediator mediator)
    {
        _repository = repository;
        _mediator = mediator;
    }

    public async Task Handle(RequestAssignedEvent notification, CancellationToken cancellationToken)
    {
        var entity = Notification.Create(
            userId: notification.AssignedUserId,
            message: $"You have been assigned to request: {notification.RequestTitle}",
            type: NotificationType.RequestAssigned,
            referenceId: notification.RequestId);

        await _repository.AddAsync(entity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        await _mediator.Publish(
            new NotificationCreatedEvent(entity), cancellationToken);
    }
}