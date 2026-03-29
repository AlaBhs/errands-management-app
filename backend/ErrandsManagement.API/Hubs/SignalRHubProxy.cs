using ErrandsManagement.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace ErrandsManagement.API.Hubs;

public class SignalRHubProxy : INotificationHubProxy
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRHubProxy(IHubContext<NotificationHub> hubContext)
        => _hubContext = hubContext;

    public async Task SendToUserAsync(Guid userId, object payload, CancellationToken ct = default)
    {
        Console.WriteLine($"[HubProxy] Sending to group {userId}");

        await _hubContext.Clients
            .Group(userId.ToString())
            .SendAsync("ReceiveNotification", payload, ct);

        Console.WriteLine($"[HubProxy] Done");
    }
}