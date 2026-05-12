namespace ErrandsManagement.Application.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Persists the file stream and returns the relative URI
    /// that can be used to retrieve the file later.
    /// </summary>
    Task<string> SaveAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken ct = default);

    /// <summary>
    /// Deletes the file at the given relative URI.
    /// No-ops silently if the file does not exist.
    /// </summary>
    Task DeleteAsync(string relativeUri, CancellationToken ct = default);

    /// <summary>
    /// Resolves a relative URI to an absolute URL for client consumption.
    /// </summary>
    string GetUrl(string relativeUri);
}