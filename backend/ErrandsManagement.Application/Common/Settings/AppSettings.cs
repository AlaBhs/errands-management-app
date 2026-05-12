namespace ErrandsManagement.Application.Common.Settings;

public sealed class AppSettings
{
    public const string SectionName = "AppSettings";
    public string FrontendBaseUrl { get; init; } = "http://localhost:5173";
}