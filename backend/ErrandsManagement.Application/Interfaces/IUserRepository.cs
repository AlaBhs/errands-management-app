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

    Task UpdateLocationAsync(UpdateLocationDto location, CancellationToken ct = default);
}