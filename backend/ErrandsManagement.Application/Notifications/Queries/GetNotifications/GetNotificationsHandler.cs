using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Queries.GetNotifications;

public sealed class GetNotificationsHandler
    : IRequestHandler<GetNotificationsQuery, NotificationListDto>
{
    private readonly INotificationRepository _repository;

    public GetNotificationsHandler(INotificationRepository repository)
        => _repository = repository;

    public async Task<NotificationListDto> Handle(
        GetNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        var notifications = await _repository
            .GetByUserIdAsync(request.UserId, cancellationToken);

        var dtos = notifications
            .Select(n => new NotificationDto(
                n.Id, n.Message, n.Type,
                n.ReferenceId, n.IsRead, n.CreatedAt))
            .ToList();

        var unreadCount = dtos.Count(n => !n.IsRead);

        return new NotificationListDto(dtos, unreadCount);
    }
}