using ErrandsManagement.Application.Interfaces;

namespace ErrandsManagement.API.IntegrationTests.Infrastructure;

internal sealed class StubFileStorageService : IFileStorageService
{
    public Task<string> SaveAsync(
        Stream stream,
        string fileName,
        string contentType,
        CancellationToken ct = default)
        => Task.FromResult(
               $"/uploads/test/{Guid.NewGuid()}{Path.GetExtension(fileName)}");

    public Task DeleteAsync(
        string relativeUri,
        CancellationToken ct = default)
        => Task.CompletedTask;

    public string GetUrl(string relativeUri) => relativeUri;
}