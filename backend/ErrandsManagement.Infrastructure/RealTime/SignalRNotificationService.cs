using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.DTOs;
using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Infrastructure.RealTime;

public class SignalRNotificationService : INotificationRealtimeService
{
    private readonly INotificationHubProxy _hubProxy;

    public SignalRNotificationService(INotificationHubProxy hubProxy)
        => _hubProxy = hubProxy;

    public async Task SendToUserAsync(
        Guid userId,
        Notification notification,
        CancellationToken cancellationToken = default)
    {
        var payload = new NotificationDto(
            notification.Id,
            notification.Message,
            notification.Type,
            notification.ReferenceId,
            notification.Metadata,
            notification.IsRead,
            notification.CreatedAt);

        await _hubProxy.SendToUserAsync(userId, payload, cancellationToken);
    }
}