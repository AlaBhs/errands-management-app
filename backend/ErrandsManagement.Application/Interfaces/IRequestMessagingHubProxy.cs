namespace ErrandsManagement.Application.Interfaces;

/// <summary>
/// Abstracts the real-time transport hub for request messaging.
/// Application defines it; API registers the SignalR implementation.
/// Infrastructure's <c>SignalRRequestMessagingService</c> calls this,
/// maintaining zero coupling to the SignalR hub type.
/// </summary>
public interface IRequestMessagingHubProxy
{
    /// <summary>
    /// Sends <paramref name="payload"/> to all connections in the
    /// request-specific group ("request-{requestId}").
    /// </summary>
    Task SendToRequestGroupAsync(
        Guid requestId,
        object payload,
        CancellationToken ct = default);
}
