using ErrandsManagement.Application.Interfaces;

namespace ErrandsManagement.API.IntegrationTests.Infrastructure;

/// <summary>
/// No-op stub used in integration tests to avoid requiring a real SignalR hub.
/// </summary>
internal sealed class StubRequestMessagingHubProxy : IRequestMessagingHubProxy
{
    public Task SendToRequestGroupAsync(
        Guid requestId,
        object payload,
        CancellationToken ct = default)
        => Task.CompletedTask;
}
