namespace ErrandsManagement.Application.DTOs;
public sealed record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    string Email,
    string FullName,
    IEnumerable<string> Roles
);
