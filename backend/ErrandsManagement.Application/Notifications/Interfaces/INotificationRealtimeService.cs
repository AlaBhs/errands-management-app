using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Application.Notifications.Interfaces;

/// <summary>
/// Abstraction over any real-time delivery channel.
/// Application layer depends only on this interface — never on SignalR.
/// </summary>
public interface INotificationRealtimeService
{
    Task SendToUserAsync(Guid userId, Notification notification, CancellationToken cancellationToken = default);
}