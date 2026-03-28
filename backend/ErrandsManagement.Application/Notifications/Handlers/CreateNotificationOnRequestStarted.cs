using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Application.Notifications.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Handlers;

public sealed class CreateNotificationOnRequestStarted
    : INotificationHandler<RequestStartedEvent>
{
    private readonly INotificationRepository _repository;
    private readonly IMediator _mediator;

    public CreateNotificationOnRequestStarted(INotificationRepository repository, IMediator mediator)
    {
        _repository = repository;
        _mediator = mediator;
    }

    public async Task Handle(RequestStartedEvent notification, CancellationToken cancellationToken)
    {
        var entity = Notification.Create(
            userId: notification.RequesterId,
            message: $"Work on your request '{notification.RequestTitle}' has started.",
            type: NotificationType.RequestStarted,
            referenceId: notification.RequestId);

        await _repository.AddAsync(entity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        await _mediator.Publish(new NotificationCreatedEvent(entity), cancellationToken);
    }
}