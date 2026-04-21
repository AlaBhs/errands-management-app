using ErrandsManagement.Application.RequestMessages.DTOs;

namespace ErrandsManagement.Application.Interfaces;

/// <summary>
/// Abstraction over any real-time delivery channel for request messages.
/// Application defines the contract; Infrastructure (SignalR) provides the implementation.
/// </summary>
public interface IRequestMessagingRealtimeService
{
    /// <summary>
    /// Broadcasts a new message to ALL participants of the request
    /// (i.e., everyone subscribed to the request's SignalR group).
    /// </summary>
    Task PushMessageToRequestGroupAsync(
        RequestMessageDto message,
        CancellationToken cancellationToken = default);
}
