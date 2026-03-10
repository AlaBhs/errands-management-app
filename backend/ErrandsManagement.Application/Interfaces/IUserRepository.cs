using ErrandsManagement.Application.DTOs;

namespace ErrandsManagement.Application.Interfaces;

public interface IUserRepository
{
    Task<UserDto?> FindByEmailAsync(string email, CancellationToken ct = default);

    Task CreateAsync(UserDto user, string password, CancellationToken ct = default);

    Task AssignRoleAsync(Guid userId, string role, CancellationToken ct = default);

    Task<bool> CheckPasswordAsync(Guid userId, string password, CancellationToken ct = default);

    Task<string?> GetActiveRefreshTokenAsync(Guid userId, string token, CancellationToken ct = default);

    Task AddRefreshTokenAsync(Guid userId, string token, DateTime expiresAt, CancellationToken ct = default);

    Task RevokeAllActiveRefreshTokensAsync(Guid userId, CancellationToken ct = default);

    Task RevokeRefreshTokenAsync(Guid userId, string token, CancellationToken ct = default);

    Task<UserDto?> FindByRefreshTokenAsync(string token, CancellationToken ct = default);

    Task<bool> RefreshTokenIsActiveAsync(string token, CancellationToken ct = default);
}