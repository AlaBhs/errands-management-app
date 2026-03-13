namespace ErrandsManagement.Application.Users.DTOs;

public sealed record UserListItemDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    bool IsActive,
    DateTimeOffset CreatedAt
);