namespace ErrandsManagement.Application.Common.Settings;

public sealed class GeminiSettings
{
    public const string SectionName = "GeminiSettings";
    public string ApiKey { get; init; } = string.Empty;
    public int TimeoutSeconds { get; init; } = 30;
}
