using ErrandsManagement.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace ErrandsManagement.Infrastructure.FileStorage;

public sealed class LocalFileStorageService : IFileStorageService
{
    // Files land in  {ContentRootPath}/wwwroot/uploads/{requestId}/{uniqueFileName}
    private const string UploadsFolder = "uploads";

    private readonly string _uploadsRootPath;
    private readonly string _baseUrl;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(
        IWebHostEnvironment env,
        ILogger<LocalFileStorageService> logger)
    {
        _uploadsRootPath = Path.Combine(env.WebRootPath, UploadsFolder);
        _baseUrl = $"/{UploadsFolder}";
        _logger = logger;

        // Ensure root uploads directory exists on startup
        Directory.CreateDirectory(_uploadsRootPath);
    }

    public async Task<string> SaveAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken ct = default)
    {
        // Sanitise the original file name — keep only the extension
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var uniqueName = $"{Guid.NewGuid()}{extension}";

        // Organise files into a sub-folder per day to avoid huge flat directories
        var datePath = DateTime.UtcNow.ToString("yyyy/MM/dd");
        var subDirectory = Path.Combine(_uploadsRootPath, datePath);
        Directory.CreateDirectory(subDirectory);

        var fullPath = Path.Combine(subDirectory, uniqueName);
        var relativeUri = $"{_baseUrl}/{datePath}/{uniqueName}";

        await using var fileWriteStream = new FileStream(
            fullPath,
            FileMode.Create,
            FileAccess.Write,
            FileShare.None,
            bufferSize: 81_920,
            useAsync: true);

        await fileStream.CopyToAsync(fileWriteStream, ct);

        _logger.LogInformation(
            "Saved attachment {FileName} → {RelativeUri}",
            fileName, relativeUri);

        return relativeUri;
    }

    public Task DeleteAsync(string relativeUri, CancellationToken ct = default)
    {
        // Convert relative URI back to absolute path
        // relativeUri format: /uploads/yyyy/MM/dd/uniqueName.ext
        var relativePath = relativeUri.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(
            Directory.GetParent(_uploadsRootPath)!.FullName,
            relativePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("Deleted attachment {RelativeUri}", relativeUri);
        }
        else
        {
            _logger.LogWarning(
                "DeleteAsync: file not found at {FullPath} — skipping",
                fullPath);
        }

        return Task.CompletedTask;
    }

    public string GetUrl(string relativeUri) => relativeUri;
}