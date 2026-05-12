using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Infrastructure.Data.Seed;
using ErrandsManagement.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.API.Common.Extensions;

public static class DatabaseExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var isTest = app.Environment.EnvironmentName == "Test";

        if (isTest) return;

        db.Database.Migrate();

        // Always — seeds roles and default admin
        await IdentitySeeder.SeedAsync(scope.ServiceProvider);

        // Dev only — seeds demo users and requests
        if (app.Environment.IsDevelopment())
        {
            var userManager = scope.ServiceProvider
                .GetRequiredService<UserManager<ApplicationUser>>();
            var logger = app.Services
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger("DbInitializer");

            await DbInitializer.SeedAsync(db, userManager, logger);
        }
    }
}