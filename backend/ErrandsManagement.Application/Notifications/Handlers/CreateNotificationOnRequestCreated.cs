using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
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
    private readonly IMediator _mediator;

    public CreateNotificationOnRequestCreated(
        INotificationRepository notificationRepository,
        IUserRepository userRepository,
        IMediator mediator)
    {
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
        _mediator = mediator;
    }

    public async Task Handle(RequestCreatedEvent notification, CancellationToken cancellationToken)
    {
        var admins = await _userRepository.GetByRoleAsync(UserRole.Admin, cancellationToken);

        if (!admins.Any())
            return;

        var notifications = admins
            .Select(admin => Notification.Create(
                userId: admin.Id,
                message: $"New request submitted: {notification.RequestTitle}",
                type: NotificationType.RequestCreated,
                referenceId: notification.RequestId))
            .ToList();

        foreach (var entity in notifications)
            await _notificationRepository.AddAsync(entity, cancellationToken);

        await _notificationRepository.SaveChangesAsync(cancellationToken);

        foreach (var entity in notifications)
            await _mediator.Publish(new NotificationCreatedEvent(entity), cancellationToken);
    }
}