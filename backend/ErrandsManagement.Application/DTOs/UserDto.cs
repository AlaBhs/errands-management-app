namespace ErrandsManagement.Application.DTOs;

public sealed record UserDto(
    Guid Id,
    string Email,
    string FullName,
    IEnumerable<string> Roles,
    bool IsActive,
    double? Latitude = null,
    double? Longitude = null,
    string? City = null,
    string? ProfilePhotoUrl = null
);