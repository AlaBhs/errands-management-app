namespace ErrandsManagement.Application.Interfaces;

/// <summary>
/// Abstracts the real-time transport hub.
/// Application defines it; API registers the implementation.
/// Infrastructure's SignalRNotificationService calls this — zero hub type coupling.
/// </summary>
public interface INotificationHubProxy
{
    Task SendToUserAsync(Guid userId, object payload, CancellationToken ct = default);
}