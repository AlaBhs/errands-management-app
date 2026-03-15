using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Users.Queries.GetAllUsers;
using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Infrastructure.Identity;
using ErrandsManagement.Infrastructure.IntegrationTests.Data;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System.Data;

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

    private static UserDto NewUserDto(string? fullName = null) => new(
        Id: Guid.NewGuid(),
        Email: $"user_{Guid.NewGuid():N}@test.local",
        FullName: fullName ?? "Test User",
        Roles: [],
        IsActive: true);

    private CancellationToken CT => TestContext.Current.CancellationToken;

    // ── Helper: seed a user with a role ───────────────────────────────────────

    private static async Task<UserDto> SeedUserWithRole(
        UserRepository repo,
        UserManager<ApplicationUser> userManager,
        AppDbContext context,
        string role,
        string? fullName = null,
        CancellationToken ct = default)
    {
        // Ensure role exists
        if (!context.Roles.Any(r => r.Name == role))
        {
            context.Roles.Add(new IdentityRole<Guid>
            {
                Id = Guid.NewGuid(),
                Name = role,
                NormalizedName = role.ToUpperInvariant()
            });
            await context.SaveChangesAsync(ct);
        }

        var dto = NewUserDto(fullName);
        await repo.CreateAsync(dto, "pass", ct);
        await repo.AssignRoleAsync(dto.Id, role, ct);
        return dto;
    }

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

    // ── SetIsActiveAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task SetIsActiveAsync_Should_Persist_False()
    {
        var context = TestDbContextFactory.Create();
        var (repo, _) = Build(context);
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        await repo.SetIsActiveAsync(dto.Id, false, CT);

        var saved = await context.Users.FindAsync([dto.Id], CT);
        saved!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task SetIsActiveAsync_Should_Persist_True_After_Reactivation()
    {
        var context = TestDbContextFactory.Create();
        var (repo, _) = Build(context);
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        await repo.SetIsActiveAsync(dto.Id, false, CT);
        await repo.SetIsActiveAsync(dto.Id, true, CT);

        var saved = await context.Users.FindAsync([dto.Id], CT);
        saved!.IsActive.Should().BeTrue();
    }

    // ── FindListItemByIdAsync ─────────────────────────────────────────────────

    [Fact]
    public async Task FindListItemByIdAsync_Should_Return_Null_When_User_Not_Found()
    {
        var (repo, _) = Build(TestDbContextFactory.Create());

        var result = await repo.FindListItemByIdAsync(Guid.NewGuid(), CT);

        result.Should().BeNull();
    }

    [Fact]
    public async Task FindListItemByIdAsync_Should_Return_Correct_Fields()
    {
        var context = TestDbContextFactory.Create();
        var (repo, userManager) = Build(context);
        var dto = await SeedUserWithRole(repo, userManager, context, "Collaborator", "Alice Smith", CT);

        var result = await repo.FindListItemByIdAsync(dto.Id, CT);

        result.Should().NotBeNull();
        result!.Id.Should().Be(dto.Id);
        result.FullName.Should().Be("Alice Smith");
        result.Email.Should().Be(dto.Email);
        result.Role.Should().Be("Collaborator");
        result.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task FindListItemByIdAsync_Should_Return_Empty_Role_When_No_Role_Assigned()
    {
        var context = TestDbContextFactory.Create();
        var (repo, _) = Build(context);
        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);

        var result = await repo.FindListItemByIdAsync(dto.Id, CT);

        result.Should().NotBeNull();
        result!.Role.Should().BeEmpty();
    }

    // ── GetPagedAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetPagedAsync_Should_Return_All_Users_With_No_Filters()
    {
        var context = TestDbContextFactory.Create();
        var (repo, userManager) = Build(context);

        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Alice", CT);
        await SeedUserWithRole(repo, userManager, context, "Courier", "Bob", CT);

        var parameters = new UserQueryParameters { Page = 1, PageSize = 10 };
        var result = await repo.GetPagedAsync(parameters, CT);

        result.TotalCount.Should().Be(2);
        result.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetPagedAsync_Should_Filter_By_Role()
    {
        var context = TestDbContextFactory.Create();
        var (repo, userManager) = Build(context);

        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Alice", CT);
        await SeedUserWithRole(repo, userManager, context, "Courier", "Bob", CT);

        var parameters = new UserQueryParameters { Page = 1, PageSize = 10, Role = "Courier" };
        var result = await repo.GetPagedAsync(parameters, CT);

        result.TotalCount.Should().Be(1);
        result.Items.Should().ContainSingle(u => u.FullName == "Bob");
    }

    [Fact]
    public async Task GetPagedAsync_Should_Filter_By_Name_Search()
    {
        var context = TestDbContextFactory.Create();
        var (repo, userManager) = Build(context);

        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Alice Smith", CT);
        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Bob Jones", CT);

        var parameters = new UserQueryParameters { Page = 1, PageSize = 10, Search = "alice" };
        var result = await repo.GetPagedAsync(parameters, CT);

        result.TotalCount.Should().Be(1);
        result.Items.Should().ContainSingle(u => u.FullName == "Alice Smith");
    }

    [Fact]
    public async Task GetPagedAsync_Should_Filter_By_Email_Search()
    {
        var context = TestDbContextFactory.Create();
        var (repo, userManager) = Build(context);

        var dto = NewUserDto();
        await repo.CreateAsync(dto, "pass", CT);
        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Bob", CT);

        var parameters = new UserQueryParameters { Page = 1, PageSize = 10, Search = dto.Email[..8] };
        var result = await repo.GetPagedAsync(parameters, CT);

        result.Items.Should().ContainSingle(u => u.Id == dto.Id);
    }

    [Fact]
    public async Task GetPagedAsync_Should_Paginate_Correctly()
    {
        var context = TestDbContextFactory.Create();
        var (repo, userManager) = Build(context);

        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Alice", CT);
        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Bob", CT);
        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Charlie", CT);

        var page1 = await repo.GetPagedAsync(
            new UserQueryParameters { Page = 1, PageSize = 2 }, CT);
        var page2 = await repo.GetPagedAsync(
            new UserQueryParameters { Page = 2, PageSize = 2 }, CT);

        page1.Items.Should().HaveCount(2);
        page2.Items.Should().HaveCount(1);
        page1.TotalCount.Should().Be(3);
        page2.TotalCount.Should().Be(3);
    }

    [Fact]
    public async Task GetPagedAsync_Should_Order_By_FullName()
    {
        var context = TestDbContextFactory.Create();
        var (repo, userManager) = Build(context);

        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Charlie", CT);
        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Alice", CT);
        await SeedUserWithRole(repo, userManager, context, "Collaborator", "Bob", CT);

        var result = await repo.GetPagedAsync(
            new UserQueryParameters { Page = 1, PageSize = 10 }, CT);

        result.Items.Select(u => u.FullName)
            .Should().BeInAscendingOrder();
    }
    [Fact]
    public async Task GetPagedAsync_Should_Filter_Active_Only()
    {
        var context = TestDbContextFactory.Create();
        var (repo, userManager) = Build(context);

        var activeUser = await SeedUserWithRole(repo, userManager, context, "Collaborator", "Alice", CT);
        var inactiveUser = await SeedUserWithRole(repo, userManager, context, "Collaborator", "Bob", CT);
        await repo.SetIsActiveAsync(inactiveUser.Id, false, CT);

        var result = await repo.GetPagedAsync(
            new UserQueryParameters { Page = 1, PageSize = 10, IsActive = true }, CT);

        result.TotalCount.Should().Be(1);
        result.Items.Should().ContainSingle(u => u.Id == activeUser.Id);
    }

    [Fact]
    public async Task GetPagedAsync_Should_Filter_Inactive_Only()
    {
        var context = TestDbContextFactory.Create();
        var (repo, userManager) = Build(context);

        var activeUser = await SeedUserWithRole(repo, userManager, context, "Collaborator", "Alice", CT);
        var inactiveUser = await SeedUserWithRole(repo, userManager, context, "Collaborator", "Bob", CT);
        await repo.SetIsActiveAsync(inactiveUser.Id, false, CT);

        var result = await repo.GetPagedAsync(
            new UserQueryParameters { Page = 1, PageSize = 10, IsActive = false }, CT);

        result.TotalCount.Should().Be(1);
        result.Items.Should().ContainSingle(u => u.Id == inactiveUser.Id);
    }
}