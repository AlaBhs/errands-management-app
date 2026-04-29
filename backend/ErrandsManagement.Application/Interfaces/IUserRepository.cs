using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Users.DTOs;
using ErrandsManagement.Application.Users.Queries.GetAllUsers;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.Interfaces;

public interface IUserRepository
{
    Task<UserDto?> FindByEmailAsync(string email, CancellationToken ct = default);

    Task<UserDto?> FindByIdAsync(Guid userId, CancellationToken ct = default);

    Task<List<User>> GetByRoleAsync(UserRole role, CancellationToken cancellationToken = default);

    Task<UserListItemDto?> FindListItemByIdAsync(Guid userId, CancellationToken ct = default);

    Task CreateAsync(UserDto user, string password, CancellationToken ct = default);

    Task AssignRoleAsync(Guid userId, string role, CancellationToken ct = default);

    Task<bool> CheckPasswordAsync(Guid userId, string password, CancellationToken ct = default);

    Task AddRefreshTokenAsync(Guid userId, string token, DateTime expiresAt, CancellationToken ct = default);

    Task RevokeAllActiveRefreshTokensAsync(Guid userId, CancellationToken ct = default);

    Task RevokeRefreshTokenAsync(Guid userId, string token, CancellationToken ct = default);

    Task<UserDto?> FindByRefreshTokenAsync(string token, CancellationToken ct = default);

    Task<bool> RefreshTokenIsActiveAsync(string token, CancellationToken ct = default);

    Task<PagedResult<UserListItemDto>> GetPagedAsync(UserQueryParameters parameters, CancellationToken ct = default);

    Task SetIsActiveAsync(Guid userId, bool isActive, CancellationToken ct = default);

    Task UpdateLocationAsync(Guid userId, UpdateLocationDto location, CancellationToken ct = default);

    // Creates a user without a password; EmailConfirmed = false
    Task<Guid> CreateWithoutPasswordAsync(UserDto dto, CancellationToken ct = default);

    // Returns the ASP.NET Identity email-confirmation token (time-limited, single-use)
    Task<string> GenerateEmailConfirmationTokenAsync(Guid userId, CancellationToken ct = default);

    // Validates token, sets password, marks email confirmed
    Task SetPasswordAsync(Guid userId, string token, string newPassword, CancellationToken ct = default);

    // Updates FullName and optional ProfilePhotoUrl
    Task UpdateProfileAsync(Guid userId, string fullName, string? profilePhotoUrl, CancellationToken ct = default);

    // Returns the ApplicationUser entity (needed by ChangePasswordCommand)
    Task<UserDto?> GetApplicationUserAsync(Guid userId, CancellationToken ct = default);
}