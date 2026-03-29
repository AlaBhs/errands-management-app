using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ErrandsManagement.API.Hubs;

/// <summary>
/// SignalR hub for real-time notifications.
/// Each authenticated user joins a group named after their UserId.
/// JWT authentication is enforced via [Authorize].
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // Add the user to a group identified by their UserId.
        // This allows server-side push to a specific user across multiple connections.
        var userId = Context.UserIdentifier
            ?? throw new HubException("User is not authenticated.");

        Console.WriteLine($"[Hub] User connected: {userId}, ConnectionId: {Context.ConnectionId}");

        await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (userId is not null)
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);

        await base.OnDisconnectedAsync(exception);
    }
}