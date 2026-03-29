using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Handlers;

/// <summary>
/// Listens to NotificationCreatedEvent and delivers via real-time channel.
/// Uses INotificationRealtimeService — for abstraction.
/// </summary>
public sealed class SendRealtimeOnNotificationCreated
    : INotificationHandler<NotificationCreatedEvent>
{
    private readonly INotificationRealtimeService _realtimeService;

    public SendRealtimeOnNotificationCreated(INotificationRealtimeService realtimeService)
        => _realtimeService = realtimeService;

    public async Task Handle(NotificationCreatedEvent notification, CancellationToken cancellationToken)
    {
        Console.WriteLine($"[SignalR] Sending to user {notification.Notification.UserId}");

        await _realtimeService.SendToUserAsync(
            notification.Notification.UserId,
            notification.Notification,
            cancellationToken);

        Console.WriteLine($"[SignalR] Sent successfully");
    }
}