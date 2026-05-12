using ErrandsManagement.Infrastructure.FileStorage;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace ErrandsManagement.Infrastructure.IntegrationTests.Storage;

public class LocalFileStorageServiceTests : IDisposable
{
    private readonly string                  _tempRoot;
    private readonly LocalFileStorageService _service;

    private CancellationToken CT => TestContext.Current.CancellationToken;

    public LocalFileStorageServiceTests()
    {
        // Use a temp directory so tests don't pollute the real wwwroot
        _tempRoot = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(_tempRoot);

        var envMock = new Mock<IWebHostEnvironment>();
        envMock.Setup(e => e.WebRootPath).Returns(_tempRoot);

        _service = new LocalFileStorageService(
            envMock.Object,
            NullLogger<LocalFileStorageService>.Instance);
    }

    public void Dispose()
    {
        if (Directory.Exists(_tempRoot))
            Directory.Delete(_tempRoot, recursive: true);
    }

    [Fact]
    public async Task SaveAsync_Should_Write_File_And_Return_Forward_Slash_Uri()
    {
        var content = "test file content"u8.ToArray();
        await using var stream = new MemoryStream(content);

        var uri = await _service.SaveAsync(
            stream, "test.pdf", "application/pdf", CT);

        // URI must use forward slashes — never backslashes
        uri.Should().NotContain("\\");
        uri.Should().StartWith("/uploads/");
        uri.Should().EndWith(".pdf");
    }

    [Fact]
    public async Task SaveAsync_Should_Create_File_On_Disk()
    {
        var content = "test file content"u8.ToArray();
        await using var stream = new MemoryStream(content);

        var uri      = await _service.SaveAsync(
            stream, "test.pdf", "application/pdf", CT);

        // Convert URI back to path and verify file exists
        var relativePath = uri.TrimStart('/')
            .Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(_tempRoot, relativePath);

        File.Exists(fullPath).Should().BeTrue();
    }

    [Fact]
    public async Task SaveAsync_Should_Preserve_File_Contents()
    {
        var content = "hello world"u8.ToArray();
        await using var stream = new MemoryStream(content);

        var uri      = await _service.SaveAsync(
            stream, "hello.pdf", "application/pdf", CT);

        var relativePath = uri.TrimStart('/')
            .Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(_tempRoot, relativePath);

        var written = await File.ReadAllBytesAsync(fullPath, CT);
        written.Should().BeEquivalentTo(content);
    }

    [Fact]
    public async Task DeleteAsync_Should_Remove_File_From_Disk()
    {
        var content = "delete me"u8.ToArray();
        await using var stream = new MemoryStream(content);

        var uri          = await _service.SaveAsync(
            stream, "delete.pdf", "application/pdf", CT);
        var relativePath = uri.TrimStart('/')
            .Replace('/', Path.DirectorySeparatorChar);
        var fullPath     = Path.Combine(_tempRoot, relativePath);

        File.Exists(fullPath).Should().BeTrue();

        await _service.DeleteAsync(uri, CT);

        File.Exists(fullPath).Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_Should_Not_Throw_When_File_Does_Not_Exist()
    {
        var act = async () =>
            await _service.DeleteAsync("/uploads/2026/01/01/nonexistent.pdf");

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task SaveAsync_Should_Generate_Unique_Names_For_Same_File()
    {
        var content = "same content"u8.ToArray();

        await using var s1 = new MemoryStream(content);
        await using var s2 = new MemoryStream(content);

        var uri1 = await _service.SaveAsync(s1, "file.pdf", "application/pdf", CT);
        var uri2 = await _service.SaveAsync(s2, "file.pdf", "application/pdf", CT);

        uri1.Should().NotBe(uri2);
    }

    [Fact]
    public void GetUrl_Should_Return_Relative_Uri_Unchanged()
    {
        var uri    = "/uploads/2026/03/21/file.pdf";
        var result = _service.GetUrl(uri);
        result.Should().Be(uri);
    }
}
