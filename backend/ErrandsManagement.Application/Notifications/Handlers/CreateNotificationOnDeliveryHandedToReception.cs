using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Application.Notifications.Helpers;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Handlers;

public sealed class CreateNotificationOnDeliveryHandedToReception
    : INotificationHandler<DeliveryBatchHandedToReceptionEvent>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISystemConfigReader _configReader;
    private readonly IUserPreferencesRepository _prefsRepo;
    private readonly IMediator _mediator;

    public CreateNotificationOnDeliveryHandedToReception(
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

    public async Task Handle(
        DeliveryBatchHandedToReceptionEvent notification,
        CancellationToken cancellationToken)
    {
        var receptionUsers = await _userRepository.GetByRoleAsync(UserRole.Reception, cancellationToken);
        if (!receptionUsers.Any()) return;

        foreach (var user in receptionUsers)
        {
            if (!await NotificationGate.IsAllowedAsync(
                    user.Id, UserRole.Reception,
                    NotificationType.DeliveryHandedToReception,
                    _configReader, _prefsRepo, cancellationToken))
                continue;

            var entity = Notification.Create(
                userId: user.Id,
                message: $"New delivery ready for pickup: '{notification.BatchTitle}' (Client: {notification.ClientName}).",
                type: NotificationType.DeliveryHandedToReception,
                referenceId: notification.BatchId);

            await _notificationRepository.AddAsync(entity, cancellationToken);
            await _notificationRepository.SaveChangesAsync(cancellationToken);
            await _mediator.Publish(new NotificationCreatedEvent(entity), cancellationToken);
        }
    }
}