using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Application.Notifications.Helpers;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Handlers;

public sealed class CreateNotificationOnRequestCompleted
    : INotificationHandler<RequestCompletedEvent>
{
    private readonly INotificationRepository _repository;
    private readonly ISystemConfigReader _configReader;
    private readonly IUserPreferencesRepository _prefsRepo;
    private readonly IMediator _mediator;

    public CreateNotificationOnRequestCompleted(
        INotificationRepository repository,
        ISystemConfigReader configReader,
        IUserPreferencesRepository prefsRepo,
        IMediator mediator)
    {
        _repository = repository;
        _configReader = configReader;
        _prefsRepo = prefsRepo;
        _mediator = mediator;
    }

    public async Task Handle(RequestCompletedEvent notification, CancellationToken cancellationToken)
    {
        if (!await NotificationGate.IsAllowedAsync(
                notification.RequesterId, UserRole.Collaborator,
                NotificationType.RequestCompleted,
                _configReader, _prefsRepo, cancellationToken))
            return;

        var entity = Notification.Create(
            userId: notification.RequesterId,
            message: $"Your request '{notification.RequestTitle}' has been completed.",
            type: NotificationType.RequestCompleted,
            referenceId: notification.RequestId);

        await _repository.AddAsync(entity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        await _mediator.Publish(new NotificationCreatedEvent(entity), cancellationToken);
    }
}