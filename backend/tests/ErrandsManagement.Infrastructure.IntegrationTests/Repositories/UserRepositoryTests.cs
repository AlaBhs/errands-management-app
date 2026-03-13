using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Infrastructure.Identity;
using ErrandsManagement.Infrastructure.IntegrationTests.Data;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace ErrandsManagement.Infrastructure.IntegrationTests.Repositories;

/// <summary>
/// Integration tests for UserRepository.
/// Each test creates a fresh in-memory SQLite database and a real UserManager
/// backed by it — no mocking, everything hits actual EF Core + Identity.
/// </summary>
public class UserRepositoryTests
{
    // ── Test infrastructure ────────────────────────────────────────────────────

    private static (UserRepository repo, UserManager<ApplicationUser> userManager) Build(
        AppDbContext context)
    {
        var services = new ServiceCollection();

        services.AddSingleton(context);
        services.AddLogging();

        services
            .AddIdentityCore<ApplicationUser>(o =>
            {
                o.Password.RequireDigit = false;
                o.Password.RequireLowercase = false;
                o.Password.RequireUppercase = false;
                o.Password.RequireNonAlphanumeric = false;
                o.Password.RequiredLength = 4;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<AppDbContext>();

        var sp = services.BuildServiceProvider();
        var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();
        var repo = new UserRepository(userManager, context);

        return (repo, userManager);
    }

    private static UserDto NewUserDto() => new(
        Id: Guid.NewGuid(),
        Email: $"user_{Guid.NewGuid():N}@test.local",
        FullName: "Test User",
        Roles: [],
        true);

    private CancellationToken CT => TestContext.Current.CancellationToken;

    // ── FindByEmailAsync ───────────────────────────────────────────────────────

    [Fact]
    public async Task FindByEmailAsync_Should_Return_Null_When_User_Not_Found()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());

        var result = await repo.FindByEmailAsync("nobody@test.local", CT);

        result.Should().BeNull();
    }

    [Fact]
    public async Task FindByEmailAsync_Should_Return_UserDto_When_Found()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());
        var dto = NewUserDto();

        await repo.CreateAsync(dto, "pass", CT);

        var result = await repo.FindByEmailAsync(dto.Email, CT);

        result.Should().NotBeNull();
        result!.Email.Should().Be(dto.Email);
        result.FullName.Should().Be(dto.FullName);
    }

    // ── CreateAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_Should_Persist_User()
    {
        var context = TestDbContextFactory.Create();
        var (repo, _) = Build(context);
        var dto = NewUserDto();

        await repo.CreateAsync(dto, "pass", CT);

        var saved = await context.Users.FindAsync([dto.Id], CT);
        saved.Should().NotBeNull();
        saved!.Email.Should().Be(dto.Email);
    }

    // ── AddRefreshTokenAsync ──────────────────────────────────────────────────

    [Fact]
    public async Task AddRefreshTokenAsync_Should_Persist_Token()
    {
        var context = TestDbContextFactory.Create();
        var (repo, _) = Build(context);
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        var token = Guid.NewGuid().ToString();
        await repo.AddRefreshTokenAsync(dto.Id, token, DateTime.UtcNow.AddDays(7), CT);

        var saved = context.RefreshTokens.First(t => t.Token == token);
        saved.Should().NotBeNull();
        saved.Token.Should().Be(token);
        saved.IsActive.Should().BeTrue();
    }

    // ── RefreshTokenIsActiveAsync ─────────────────────────────────────────────

    [Fact]
    public async Task RefreshTokenIsActiveAsync_Should_Return_True_For_Active_Token()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        var token = Guid.NewGuid().ToString();
        await repo.AddRefreshTokenAsync(dto.Id, token, DateTime.UtcNow.AddDays(7), CT);

        var result = await repo.RefreshTokenIsActiveAsync(token, CT);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task RefreshTokenIsActiveAsync_Should_Return_False_For_Expired_Token()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        var token = Guid.NewGuid().ToString();
        await repo.AddRefreshTokenAsync(dto.Id, token, DateTime.UtcNow.AddDays(-1), CT);

        var result = await repo.RefreshTokenIsActiveAsync(token, CT);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task RefreshTokenIsActiveAsync_Should_Return_False_For_Unknown_Token()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());

        var result = await repo.RefreshTokenIsActiveAsync("token-that-does-not-exist", CT);

        result.Should().BeFalse();
    }

    // ── RevokeRefreshTokenAsync ───────────────────────────────────────────────

    [Fact]
    public async Task RevokeRefreshTokenAsync_Should_Deactivate_Token()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        var token = Guid.NewGuid().ToString();
        await repo.AddRefreshTokenAsync(dto.Id, token, DateTime.UtcNow.AddDays(7), CT);

        await repo.RevokeRefreshTokenAsync(dto.Id, token, CT);

        var isActive = await repo.RefreshTokenIsActiveAsync(token, CT);
        isActive.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_Should_Not_Affect_Other_Tokens()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        var tokenA = Guid.NewGuid().ToString();
        var tokenB = Guid.NewGuid().ToString();
        await repo.AddRefreshTokenAsync(dto.Id, tokenA, DateTime.UtcNow.AddDays(7), CT);
        await repo.AddRefreshTokenAsync(dto.Id, tokenB, DateTime.UtcNow.AddDays(7), CT);

        await repo.RevokeRefreshTokenAsync(dto.Id, tokenA, CT);

        var isBActive = await repo.RefreshTokenIsActiveAsync(tokenB, CT);
        isBActive.Should().BeTrue();
    }

    // ── RevokeAllActiveRefreshTokensAsync ─────────────────────────────────────

    [Fact]
    public async Task RevokeAllActiveRefreshTokensAsync_Should_Revoke_All_Active_Tokens()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        var tokenA = Guid.NewGuid().ToString();
        var tokenB = Guid.NewGuid().ToString();
        await repo.AddRefreshTokenAsync(dto.Id, tokenA, DateTime.UtcNow.AddDays(7), CT);
        await repo.AddRefreshTokenAsync(dto.Id, tokenB, DateTime.UtcNow.AddDays(7), CT);

        await repo.RevokeAllActiveRefreshTokensAsync(dto.Id, CT);

        (await repo.RefreshTokenIsActiveAsync(tokenA, CT)).Should().BeFalse();
        (await repo.RefreshTokenIsActiveAsync(tokenB, CT)).Should().BeFalse();
    }

    [Fact]
    public async Task RevokeAllActiveRefreshTokensAsync_Should_Not_Affect_Already_Expired_Tokens()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        var activeToken = Guid.NewGuid().ToString();
        var expiredToken = Guid.NewGuid().ToString();
        await repo.AddRefreshTokenAsync(dto.Id, activeToken, DateTime.UtcNow.AddDays(7), CT);
        await repo.AddRefreshTokenAsync(dto.Id, expiredToken, DateTime.UtcNow.AddDays(-1), CT);

        await repo.RevokeAllActiveRefreshTokensAsync(dto.Id, CT);

        (await repo.RefreshTokenIsActiveAsync(expiredToken, CT)).Should().BeFalse();
    }

    // ── FindByRefreshTokenAsync ───────────────────────────────────────────────

    [Fact]
    public async Task FindByRefreshTokenAsync_Should_Return_Null_When_Token_Not_Found()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());

        var result = await repo.FindByRefreshTokenAsync("unknown-token", CT);

        result.Should().BeNull();
    }

    [Fact]
    public async Task FindByRefreshTokenAsync_Should_Return_Correct_User()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        var token = Guid.NewGuid().ToString();
        await repo.AddRefreshTokenAsync(dto.Id, token, DateTime.UtcNow.AddDays(7), CT);

        var result = await repo.FindByRefreshTokenAsync(token, CT);

        result.Should().NotBeNull();
        result!.Id.Should().Be(dto.Id);
        result.Email.Should().Be(dto.Email);
    }
}