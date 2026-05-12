using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Handlers;

public sealed class CreateNotificationOnRequestCancelled
    : INotificationHandler<RequestCancelledEvent>
{
    private readonly INotificationRepository _repository;
    private readonly IMediator _mediator;

    public CreateNotificationOnRequestCancelled(INotificationRepository repository, IMediator mediator)
    {
        _repository = repository;
        _mediator = mediator;
    }

    public async Task Handle(RequestCancelledEvent notification, CancellationToken cancellationToken)
    {
        var entity = Notification.Create(
            userId: notification.RequesterId,
            message: $"Request '{notification.RequestTitle}' has been cancelled.",
            type: NotificationType.RequestCancelled,
            referenceId: notification.RequestId);

        await _repository.AddAsync(entity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        await _mediator.Publish(new NotificationCreatedEvent(entity), cancellationToken);
    }
}