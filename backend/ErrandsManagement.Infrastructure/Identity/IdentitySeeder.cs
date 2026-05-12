using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ErrandsManagement.Infrastructure.Identity;

public static class IdentitySeeder
{
    private static readonly string[] Roles = ["Admin", "Collaborator", "Courier", "Reception"];

    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var loggerFactory = services.GetRequiredService<ILoggerFactory>();
        var logger = loggerFactory.CreateLogger("IdentitySeeder");

        await SeedRolesAsync(roleManager, logger);
        await SeedDefaultAdminAsync(userManager, logger);
        await SeedDefaultReceptionUsersAsync(userManager, logger);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private static async Task SeedRolesAsync(
        RoleManager<IdentityRole<Guid>> roleManager, ILogger logger)
    {
        foreach (var role in Roles)
        {
            if (await roleManager.RoleExistsAsync(role)) continue;

            var result = await roleManager.CreateAsync(new IdentityRole<Guid>(role));

            if (result.Succeeded)
                logger.LogInformation("Role seeded: {Role}", role);
            else
                logger.LogError("Failed to seed role {Role}: {Errors}",
                    role, string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }

    private static async Task SeedDefaultAdminAsync(
        UserManager<ApplicationUser> userManager, ILogger logger)
    {
        const string adminEmail = "admin@errands.local";
        const string adminPassword = "Admin123!";

        var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin is not null)
        {
            if (!existingAdmin.IsActive)
            {
                existingAdmin.IsActive = true;
                await userManager.UpdateAsync(existingAdmin);
                logger.LogInformation("Reactivated seeded admin: {Email}", adminEmail);
            }
            return;
        }

        var admin = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FullName = "System Administrator",
            Email = adminEmail,
            UserName = adminEmail,
            EmailConfirmed = true,
            IsActive = true,
        };

        var createResult = await userManager.CreateAsync(admin, adminPassword);
        if (!createResult.Succeeded)
        {
            logger.LogError("Failed to seed admin user: {Errors}",
                string.Join(", ", createResult.Errors.Select(e => e.Description)));
            return;
        }

        var roleResult = await userManager.AddToRoleAsync(admin, "Admin");
        if (roleResult.Succeeded)
            logger.LogInformation("Default admin seeded: {Email}", adminEmail);
        else
            logger.LogError("Failed to assign Admin role to seeded user: {Errors}",
                string.Join(", ", roleResult.Errors.Select(e => e.Description)));
    }

    private static async Task SeedDefaultReceptionUsersAsync(
        UserManager<ApplicationUser> userManager, ILogger logger)
    {
        var accounts = new[]
        {
            (Email: "reception1@errands.local", FullName: "Amira Belhaj"),
            (Email: "reception2@errands.local", FullName: "Youssef Mansour"),
        };

        const string receptionPassword = "Reception123!";

        foreach (var (email, fullName) in accounts)
        {
            var existing = await userManager.FindByEmailAsync(email);
            if (existing is not null)
            {
                if (!existing.IsActive)
                {
                    existing.IsActive = true;
                    await userManager.UpdateAsync(existing);
                    logger.LogInformation("Reactivated seeded reception user: {Email}", email);
                }
                continue;
            }

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                FullName = fullName,
                Email = email,
                UserName = email,
                EmailConfirmed = true,
                IsActive = true,
            };

            var createResult = await userManager.CreateAsync(user, receptionPassword);
            if (!createResult.Succeeded)
            {
                logger.LogError(
                    "Failed to seed reception user {Email}: {Errors}",
                    email,
                    string.Join(", ", createResult.Errors.Select(e => e.Description)));
                continue;
            }

            var roleResult = await userManager.AddToRoleAsync(user, "Reception");
            if (roleResult.Succeeded)
                logger.LogInformation("Reception user seeded: {Email}", email);
            else
                logger.LogError(
                    "Failed to assign Reception role to {Email}: {Errors}",
                    email,
                    string.Join(", ", roleResult.Errors.Select(e => e.Description)));
        }
    }
}