using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;

namespace ErrandsManagement.API.IntegrationTests.Infrastructure;

/// <summary>
/// WebApplicationFactory that replaces SQL Server with SQLite in-memory,
/// overrides JwtSettings with deterministic test values, seeds Identity roles
/// + default admin, and provides helpers to create authenticated HttpClients.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    // Deterministic test secret — must be >= 256 bits (32 bytes) for HMAC-SHA256
    public const string TestJwtSecret = "test-super-secret-key-for-integration-tests-only-32bytes!!";
    public const string TestJwtIssuer = "ErrandsManagement";
    public const string TestJwtAudience = "ErrandsManagement";

    private SqliteConnection? _connection;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Override JWT configuration so the app validates tokens we mint in tests.
        // UseSetting populates IConfiguration before any binding happens.
        builder.UseEnvironment("Test");
        builder.UseSetting("JwtSettings:Secret", TestJwtSecret);
        builder.UseSetting("JwtSettings:Issuer", TestJwtIssuer);
        builder.UseSetting("JwtSettings:Audience", TestJwtAudience);
        builder.UseSetting("JwtSettings:ExpiryMinutes", "60");
        builder.UseSetting("JwtSettings:RefreshTokenDays", "7");

        builder.ConfigureServices(services =>
        {
            // ── Swap SQL Server for a shared SQLite in-memory connection ──────────
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<AppDbContext>();
            services.RemoveAll<IDbContextFactory<AppDbContext>>();
            services.RemoveAll<INotificationHubProxy>();
            services.AddScoped<INotificationHubProxy, StubNotificationHubProxy>();
            services.RemoveAll<IRequestMessagingHubProxy>();
            services.AddScoped<IRequestMessagingHubProxy, StubRequestMessagingHubProxy>();

            // Remove provider-specific services so SQL Server internals don't leak
            var efCoreServices = services
                .Where(s => s.ServiceType.Namespace?.StartsWith("Microsoft.EntityFrameworkCore") == true)
                .ToList();
            foreach (var svc in efCoreServices)
                services.Remove(svc);

            _connection = new SqliteConnection("Filename=:memory:");
            _connection.Open();

            services.AddDbContext<AppDbContext>(options =>
                options
                    .UseSqlite(_connection)
                    .ConfigureWarnings(w =>
                        w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

            services.PostConfigure<Microsoft.AspNetCore.Hosting.IWebHostEnvironment>(_ => { });

            services.AddScoped<IFileStorageService, StubFileStorageService>();

            services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = TestJwtIssuer,
                    ValidAudience = TestJwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestJwtSecret))
                };
            });
        });
    }

    public async ValueTask InitializeAsync()
    {
        using var scope = Services.CreateScope();
        var sp = scope.ServiceProvider;

        // Create all tables (Identity + domain)
        var dbContext = sp.GetRequiredService<AppDbContext>();
        await dbContext.Database.EnsureCreatedAsync();

        // Seed roles (Admin, Collaborator, Courier) + default admin user
        await IdentitySeeder.SeedAsync(sp);
    }

    public override async ValueTask DisposeAsync()
    {
        if (_connection != null)
            await _connection.DisposeAsync();
        await base.DisposeAsync();
    }

    // ── HttpClient helpers ────────────────────────────────────────────────────

    /// <summary>
    /// Returns an HttpClient pre-authenticated as a user with the given role.
    /// The userId is deterministic per role for repeatability.
    /// </summary>
    public HttpClient CreateAuthenticatedClient(string role, Guid? userId = null)
    {
        var id = userId ?? RoleToFixedGuid(role);
        var token = GenerateTestJwt(id, $"{role.ToLower()}@test.local", role);
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    /// <summary>
    /// Mints a valid signed JWT using the test secret, valid for 60 minutes.
    /// </summary>
    public static string GenerateTestJwt(Guid userId, string email, string role)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier,     userId.ToString()),
            new Claim(ClaimTypes.Role,               role),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestJwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: TestJwtIssuer,
            audience: TestJwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(60),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // ── Seed helpers ──────────────────────────────────────────────────────────

    /// <summary>Seeds a Collaborator user, returns their Id. Idempotent.</summary>
    public async Task<Guid> SeedCollaboratorAsync(
        string email = "collaborator@test.local",
        string password = "Test1234!",
        string fullName = "Test Collaborator")
        => await SeedUserAsync(email, password, fullName, "Collaborator");

    /// <summary>Seeds a Courier user, returns their Id. Idempotent.</summary>
    public async Task<Guid> SeedCourierAsync(
        string email = "courier@test.local",
        string password = "Test1234!",
        string fullName = "Test Courier")
        => await SeedUserAsync(email, password, fullName, "Courier");

    /// <summary>Seeds an Admin user, returns their Id.Idempotent.</summary>
    public async Task<Guid> SeedAdminAsync(
        string email = "admin@test.local",
        string password = "Test1234!",
        string fullName = "Test Admin")
        => await SeedUserAsync(email, password, fullName, "Admin");

    // ── Private ───────────────────────────────────────────────────────────────

    private async Task<Guid> SeedUserAsync(
        string email, string password, string fullName, string role)
    {
        using var scope = Services.CreateScope();
        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<ApplicationUser>>();

        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null)
            return existing.Id;

        var userId = Guid.NewGuid();
        var user = new ApplicationUser
        {
            Id = userId,
            FullName = fullName,
            Email = email,
            UserName = email,
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                string.Join("; ", result.Errors.Select(e => e.Description)));

        await userManager.AddToRoleAsync(user, role);
        return userId;
    }

    private static Guid RoleToFixedGuid(string role) => role switch
    {
        "Admin" => new Guid("00000000-0000-0000-0000-000000000001"),
        "Collaborator" => new Guid("00000000-0000-0000-0000-000000000002"),
        "Courier" => new Guid("00000000-0000-0000-0000-000000000003"),
        _ => Guid.NewGuid(),
    };
}