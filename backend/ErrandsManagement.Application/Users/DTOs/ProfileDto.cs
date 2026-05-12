namespace ErrandsManagement.Application.Users.DTOs;

public sealed record ProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    bool IsActive,
    string? ProfilePhotoUrl,
    DateTimeOffset CreatedAt);