using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.RequestMessages.DTOs;

namespace ErrandsManagement.Infrastructure.RealTime;

/// <summary>
/// SignalR implementation of <see cref="IRequestMessagingRealtimeService"/>.
///
/// Delegates transport to <see cref="IRequestMessagingHubProxy"/> — registered
/// in the API layer — keeping Infrastructure free of direct hub-type references.
/// Mirrors the existing SignalRNotificationService pattern.
/// </summary>
public sealed class SignalRRequestMessagingService : IRequestMessagingRealtimeService
{
    private readonly IRequestMessagingHubProxy _hubProxy;

    public SignalRRequestMessagingService(IRequestMessagingHubProxy hubProxy)
        => _hubProxy = hubProxy;

    public async Task PushMessageToRequestGroupAsync(
        RequestMessageDto message,
        CancellationToken cancellationToken = default)
    {
        Console.WriteLine(
            $"[RequestMessaging] Pushing message {message.Id} to request group {message.RequestId}");

        await _hubProxy.SendToRequestGroupAsync(message.RequestId, message, cancellationToken);
    }
}
