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
        await _hubContext.Clients
            .Group(userId.ToString())
            .SendAsync("ReceiveNotification", payload, ct);
    }
}