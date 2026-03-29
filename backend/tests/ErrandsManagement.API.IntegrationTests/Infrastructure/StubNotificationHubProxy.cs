using ErrandsManagement.Application.Interfaces;

namespace ErrandsManagement.API.IntegrationTests.Infrastructure;

internal sealed class StubNotificationHubProxy : INotificationHubProxy
{
    public Task SendToUserAsync(Guid userId, object payload, CancellationToken ct = default)
        => Task.CompletedTask;
}