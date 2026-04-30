using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.DTOs;
using ErrandsManagement.Application.Users.Queries.GetAllUsers;
using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace ErrandsManagement.Infrastructure.Identity;

public sealed class UserRepository : IUserRepository
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public UserRepository(UserManager<ApplicationUser> userManager, AppDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<UserDto?> FindByEmailAsync(string email, CancellationToken ct = default)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Email == email, ct);

        if (user is null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        return ToDto(user, roles);
    }

    public async Task<UserDto?> FindByIdAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        return ToDto(user, roles);
    }

    public async Task<List<User>> GetByRoleAsync(UserRole role, CancellationToken cancellationToken = default)
    {
        var roleName = role.ToString();

        var applicationUsers = await (
            from user in _context.Users
            join userRole in _context.UserRoles on user.Id equals userRole.UserId
            join r in _context.Roles on userRole.RoleId equals r.Id
            where r.Name == roleName && user.IsActive
            select user
        ).ToListAsync(cancellationToken);

        return applicationUsers
            .Select(u =>
            {
                var domainUser = new User(u.FullName, u.Email!, role);
                typeof(BaseEntity)
                    .GetProperty(nameof(BaseEntity.Id))!
                    .SetValue(domainUser, u.Id);
                return domainUser;
            })
            .ToList();
    }

    public async Task<UserListItemDto?> FindListItemByIdAsync(Guid userId, CancellationToken ct = default)
    {
        return await (
            from user in _context.Users
            join userRole in _context.UserRoles on user.Id equals userRole.UserId into userRoles
            from ur in userRoles.DefaultIfEmpty()
            join role in _context.Roles on ur.RoleId equals role.Id into roles
            from r in roles.DefaultIfEmpty()
            where user.Id == userId
            select new UserListItemDto(
                user.Id,
                user.FullName,
                user.Email!,
                r != null ? r.Name! : string.Empty,
                user.IsActive,
                user.CreatedAt
            )
        ).FirstOrDefaultAsync(ct);
    }

    public async Task CreateAsync(UserDto dto, string password, CancellationToken ct = default)
    {
        var user = new ApplicationUser
        {
            Id = dto.Id,
            FullName = dto.FullName,
            Email = dto.Email,
            UserName = dto.Email,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            City = dto.City
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                string.Join("; ", result.Errors.Select(e => e.Description)));
    }

    public async Task AssignRoleAsync(Guid userId, string role, CancellationToken ct = default)
    {
        var user = await FindUserByIdAsync(userId);

        var result = await _userManager.AddToRoleAsync(user, role);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                string.Join("; ", result.Errors.Select(e => e.Description)));
    }

    public async Task<bool> CheckPasswordAsync(Guid userId, string password, CancellationToken ct = default)
    {
        var user = await FindUserByIdAsync(userId);
        return await _userManager.CheckPasswordAsync(user, password);
    }

    public async Task AddRefreshTokenAsync(
        Guid userId, string token, DateTime expiresAt, CancellationToken ct = default)
    {
        var user = await _userManager.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new InvalidOperationException($"User {userId} not found.");

        user.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = token,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            UserId = userId,
        });

        await _context.SaveChangesAsync(ct);
    }

    public async Task RevokeAllActiveRefreshTokensAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new InvalidOperationException($"User {userId} not found.");

        foreach (var t in user.RefreshTokens.Where(t => t.IsActive))
            t.Revoked = true;

        await _context.SaveChangesAsync(ct);
    }

    public async Task RevokeRefreshTokenAsync(Guid userId, string token, CancellationToken ct = default)
    {
        var user = await _userManager.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new InvalidOperationException($"User {userId} not found.");

        var refreshToken = user.RefreshTokens.FirstOrDefault(t => t.Token == token);
        if (refreshToken is { IsActive: true })
            refreshToken.Revoked = true;

        await _context.SaveChangesAsync(ct);
    }

    public async Task<UserDto?> FindByRefreshTokenAsync(string token, CancellationToken ct = default)
    {
        var user = await _userManager.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == token), ct);

        if (user is null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        return ToDto(user, roles);
    }

    public async Task<bool> RefreshTokenIsActiveAsync(string token, CancellationToken ct = default)
    {
        var refreshToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == token, ct);

        return refreshToken?.IsActive ?? false;
    }

    public async Task<PagedResult<UserListItemDto>> GetPagedAsync(
        UserQueryParameters parameters, CancellationToken ct = default)
    {
        var query = from user in _context.Users
                    join userRole in _context.UserRoles on user.Id equals userRole.UserId into userRoles
                    from ur in userRoles.DefaultIfEmpty()
                    join role in _context.Roles on ur.RoleId equals role.Id into roles
                    from r in roles.DefaultIfEmpty()
                    select new { user, roleName = r != null ? r.Name : null };

        if (!string.IsNullOrWhiteSpace(parameters.Role))
            query = query.Where(x => x.roleName == parameters.Role);

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.ToLower();
            query = query.Where(x =>
                x.user.FullName.ToLower().Contains(search) ||
                (x.user.Email != null && x.user.Email.ToLower().Contains(search)));
        }

        if (parameters.IsActive.HasValue)
            query = query.Where(x => x.user.IsActive == parameters.IsActive.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderBy(x => x.user.FullName)
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(x => new UserListItemDto(
                x.user.Id,
                x.user.FullName,
                x.user.Email!,
                x.roleName ?? string.Empty,
                x.user.IsActive,
                x.user.CreatedAt
            ))
            .ToListAsync(ct);

        return PagedResult<UserListItemDto>.Create(items, parameters.Page, parameters.PageSize, totalCount);
    }

    public async Task SetIsActiveAsync(Guid userId, bool isActive, CancellationToken ct = default)
    {
        var user = await FindUserByIdAsync(userId);
        user.IsActive = isActive;
        await _userManager.UpdateAsync(user);
    }

    public async Task UpdateLocationAsync(
    Guid userId,
    UpdateLocationDto location,
    CancellationToken ct = default)
    {
        var user = await FindUserByIdAsync(userId);
        user.Latitude = location.Latitude;
        user.Longitude = location.Longitude;
        user.City = location.City;
        await _userManager.UpdateAsync(user);
    }

    public async Task<Guid> CreateWithoutPasswordAsync(UserDto dto, CancellationToken ct = default)
    {
        var user = new ApplicationUser
        {
            Id = dto.Id,
            FullName = dto.FullName,
            Email = dto.Email,
            UserName = dto.Email,
            EmailConfirmed = false  // confirmed when the user sets their password
        };
        var result = await _userManager.CreateAsync(user);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                string.Join("; ", result.Errors.Select(e => e.Description)));
        return user.Id;
    }

    public async Task<string> GenerateEmailConfirmationTokenAsync(
        Guid userId, CancellationToken ct = default)
    {
        var user = await FindUserByIdAsync(userId);
        return await _userManager.GenerateEmailConfirmationTokenAsync(user);
    }

    public async Task SetPasswordAsync(
        Guid userId, string token, string newPassword, CancellationToken ct = default)
    {
        var user = await FindUserByIdAsync(userId);

        // Confirm email first — token is single-use and time-limited by Identity
        var confirmResult = await _userManager.ConfirmEmailAsync(user, token);
        if (!confirmResult.Succeeded)
            throw new InvalidOperationException(
                string.Join("; ", confirmResult.Errors.Select(e => e.Description)));

        var addPwResult = await _userManager.AddPasswordAsync(user, newPassword);
        if (!addPwResult.Succeeded)
            throw new InvalidOperationException(
                string.Join("; ", addPwResult.Errors.Select(e => e.Description)));
    }

    public async Task UpdateProfileAsync(
        Guid userId, string fullName, string? profilePhotoUrl, CancellationToken ct = default)
    {
        var user = await FindUserByIdAsync(userId);
        user.FullName = fullName;
        if (profilePhotoUrl is not null)
            user.ProfilePhotoUrl = profilePhotoUrl;
        await _userManager.UpdateAsync(user);
    }

    public async Task<UserDto?> GetApplicationUserAsync(
        Guid userId, CancellationToken ct = default)
    {
        var user = await FindUserByIdAsync(userId);
        var roles = await _userManager.GetRolesAsync(user);
        return ToDto(user, roles);
    }

    public async Task ChangePasswordAsync(
    Guid userId, string currentPassword, string newPassword, CancellationToken ct = default)
    {
        var user = await FindUserByIdAsync(userId);
        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                string.Join("; ", result.Errors.Select(e => e.Description)));
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private async Task<ApplicationUser> FindUserByIdAsync(Guid userId)
        => await _userManager.FindByIdAsync(userId.ToString())
           ?? throw new InvalidOperationException($"User {userId} not found.");

    private static UserDto ToDto(ApplicationUser user, IEnumerable<string> roles)
    => new(user.Id, user.Email!, user.FullName, roles, user.IsActive,
           user.Latitude, user.Longitude, user.City, user.ProfilePhotoUrl);
}