using ErrandsManagement.Application.Notifications.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Queries.GetNotifications;

public sealed record GetNotificationsQuery(Guid UserId) : IRequest<NotificationListDto>;