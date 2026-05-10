namespace ErrandsManagement.Application.SystemConfiguration.DTOs;

public sealed record ConfigurationChangeLogDto(
    Guid Id,
    DateTime ChangedAt,
    Guid ChangedByUserId,
    string Section,
    string PreviousValueJson,
    string NewValueJson);