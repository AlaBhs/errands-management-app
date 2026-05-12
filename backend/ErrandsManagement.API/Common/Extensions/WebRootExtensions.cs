namespace ErrandsManagement.API.Extensions;

public static class WebRootExtensions
{
    public static WebApplication EnsureWebRootExists(
        this WebApplication app)
    {
        var wwwrootPath = Path.Combine(
            app.Environment.ContentRootPath,
            "wwwroot");

        Directory.CreateDirectory(wwwrootPath);
        app.Environment.WebRootPath = wwwrootPath;

        return app;
    }
}