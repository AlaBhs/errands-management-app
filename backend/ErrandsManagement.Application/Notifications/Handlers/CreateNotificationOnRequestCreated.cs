using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Application.Notifications.Helpers;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Handlers;

public sealed class CreateNotificationOnRequestCreated
    : INotificationHandler<RequestCreatedEvent>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISystemConfigReader _configReader;
    private readonly IUserPreferencesRepository _prefsRepo;
    private readonly IMediator _mediator;

    public CreateNotificationOnRequestCreated(
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

    public async Task Handle(RequestCreatedEvent notification, CancellationToken cancellationToken)
    {
        var admins = await _userRepository.GetByRoleAsync(UserRole.Admin, cancellationToken);
        if (!admins.Any()) return;

        foreach (var admin in admins)
        {
            if (!await NotificationGate.IsAllowedAsync(
                    admin.Id, UserRole.Admin,
                    NotificationType.RequestCreated,
                    _configReader, _prefsRepo, cancellationToken))
                continue;

            var entity = Notification.Create(
                userId: admin.Id,
                message: $"New request submitted: {notification.RequestTitle}",
                type: NotificationType.RequestCreated,
                referenceId: notification.RequestId);

            await _notificationRepository.AddAsync(entity, cancellationToken);
            await _notificationRepository.SaveChangesAsync(cancellationToken);
            await _mediator.Publish(new NotificationCreatedEvent(entity), cancellationToken);
        }
    }
}