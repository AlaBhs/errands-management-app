using ErrandsManagement.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace ErrandsManagement.API.Hubs;

/// <summary>
/// Bridges Infrastructure's <see cref="SignalRRequestMessagingService"/>
/// (which knows nothing about SignalR hub types) to the actual
/// <see cref="RequestMessagingHub"/> IHubContext.
///
/// Registered in <c>ApiExtensions</c> — the only layer that can legally
/// reference both the Application interface and the concrete Hub type.
/// </summary>
public sealed class RequestMessagingHubProxy : IRequestMessagingHubProxy
{
    private readonly IHubContext<RequestMessagingHub> _hubContext;

    public RequestMessagingHubProxy(IHubContext<RequestMessagingHub> hubContext)
        => _hubContext = hubContext;

    public async Task SendToRequestGroupAsync(
        Guid requestId,
        object payload,
        CancellationToken ct = default)
    {
        var groupName = RequestMessagingHub.GetGroupName(requestId);

        Console.WriteLine($"[RequestMessagingHubProxy] Sending to group {groupName}");

        await _hubContext.Clients
            .Group(groupName)
            .SendAsync("ReceiveRequestMessage", payload, ct);
    }
}
