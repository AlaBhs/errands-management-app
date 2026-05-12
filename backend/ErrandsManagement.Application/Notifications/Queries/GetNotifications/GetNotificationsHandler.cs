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
        var notifications = await _repository.GetPagedAsync(
            request.UserId,
            request.Parameters,
            cancellationToken);

        var unreadCount = await _repository.GetUnreadCountAsync(
            request.UserId,
            cancellationToken);

        var totalCount = await _repository.GetTotalCountAsync(
            request.UserId,
            request.Parameters.UnreadOnly,
            cancellationToken);

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.Parameters.PageSize);

        var dtos = notifications
            .Select(n => new NotificationDto(
                n.Id, n.Message, n.Type,
                n.ReferenceId, n.IsRead, n.CreatedAt))
            .ToList();

        return new NotificationListDto(
            dtos,
            unreadCount,
            request.Parameters.Page,
            request.Parameters.PageSize,
            totalCount,
            totalPages);
    }
}