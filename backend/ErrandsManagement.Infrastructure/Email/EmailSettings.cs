namespace ErrandsManagement.Infrastructure.Email;

public sealed class EmailSettings
{
    public const string SectionName = "EmailSettings";
    public string Host { get; init; } = string.Empty;
    public int Port { get; init; } = 587;
    public bool UseSsl { get; init; } = true;
    public string Username { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string FromAddress { get; init; } = string.Empty;
    public string FromName { get; init; } = "ErrandsManagement";
    public string FrontendBaseUrl { get; init; } = "http://localhost:5173";
}