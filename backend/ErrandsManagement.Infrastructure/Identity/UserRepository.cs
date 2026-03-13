using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

    public async Task CreateAsync(UserDto dto, string password, CancellationToken ct = default)
    {
        var user = new ApplicationUser
        {
            Id = dto.Id,
            FullName = dto.FullName,
            Email = dto.Email,
            UserName = dto.Email,
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

    // ── Private helpers ────────────────────────────────────────────────────

    private async Task<ApplicationUser> FindUserByIdAsync(Guid userId)
        => await _userManager.FindByIdAsync(userId.ToString())
           ?? throw new InvalidOperationException($"User {userId} not found.");

    private static UserDto ToDto(ApplicationUser user, IEnumerable<string> roles)
        => new(user.Id, user.Email!, user.FullName, roles, user.IsActive);

}