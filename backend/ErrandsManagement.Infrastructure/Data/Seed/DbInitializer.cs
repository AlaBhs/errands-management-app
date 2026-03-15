using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
using ErrandsManagement.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ErrandsManagement.Infrastructure.Data.Seed;

public static class DbInitializer
{
    private const string DefaultPassword = "Dev123!";

    public static async Task SeedAsync(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        ILogger logger)
    {
        // Idempotent — skip if requests already seeded
        if (await context.Requests.AnyAsync())
        {
            logger.LogInformation("DbInitializer: requests already present, skipping.");
            return;
        }

        logger.LogInformation("DbInitializer: seeding demo data...");

        // ── Seed users ─────────────────────────────────────────────────────────
        var sarah = await EnsureUser(userManager, "sarah.johnson@ey.local", "Sarah Johnson", "Collaborator");
        var michael = await EnsureUser(userManager, "michael.chen@ey.local", "Michael Chen", "Collaborator");
        var courier1 = await EnsureUser(userManager, "courier1@ey.local", "Ali Ben Salem", "Courier");
        var courier2 = await EnsureUser(userManager, "courier2@ey.local", "Karim Trabelsi", "Courier");

        // ── Shared address ─────────────────────────────────────────────────────
        var tunis = new Address("Rue de la Liberté", "Tunis", "1001", "Tunisia");
        var lac = new Address("Rue du Lac Malaren", "Lac II", "1053", "Tunisia");

        // ── Pending ────────────────────────────────────────────────────────────
        var p1 = new Request(
            "Office supplies procurement",
            "Need printer paper A4 x10 reams and ballpoint pens x50.",
            sarah.Id, tunis, PriorityLevel.Normal,
            DateTime.UtcNow.AddDays(2), 45m);

        var p2 = new Request(
            "IT equipment pickup",
            "Pick up laptop from HP service center and deliver to IT department.",
            sarah.Id, lac, PriorityLevel.High,
            DateTime.UtcNow.AddDays(1), null);

        var p3 = new Request(
            "Document delivery to notary",
            "Urgent delivery of signed contracts to Maître Ben Ali office.",
            michael.Id, tunis, PriorityLevel.Urgent,
            DateTime.UtcNow.AddHours(18), 30m);

        // ── Assigned ───────────────────────────────────────────────────────────
        var a1 = new Request(
            "Bank document collection",
            "Collect certified bank statements from STB Lac branch.",
            michael.Id, lac, PriorityLevel.High,
            DateTime.UtcNow.AddDays(1), 20m);
        a1.Assign(courier1.Id);

        var a2 = new Request(
            "Stationery restocking",
            "Purchase and deliver stationery items from Papeterie Centrale.",
            sarah.Id, tunis, PriorityLevel.Normal,
            DateTime.UtcNow.AddDays(3), 80m);
        a2.Assign(courier1.Id);

        // ── InProgress ─────────────────────────────────────────────────────────
        var ip1 = new Request(
            "Customs clearance documents",
            "Deliver customs clearance paperwork to port authority office.",
            michael.Id, tunis, PriorityLevel.Urgent,
            DateTime.UtcNow.AddHours(6), null);
        ip1.Assign(courier2.Id);
        ip1.Start();

        var ip2 = new Request(
            "Courier to Ministry of Finance",
            "Deliver official correspondence to Ministry of Finance.",
            sarah.Id, tunis, PriorityLevel.High,
            DateTime.UtcNow.AddHours(12), 15m);
        ip2.Assign(courier2.Id);
        ip2.Start();

        // ── Completed ──────────────────────────────────────────────────────────
        var c1 = new Request(
            "Monthly invoice collection",
            "Collect invoices from 3 suppliers in La Marsa.",
            sarah.Id, lac, PriorityLevel.Normal,
            DateTime.UtcNow.AddDays(-1), 35m);
        c1.Assign(courier1.Id);
        c1.Start();
        c1.Complete(32m, "All invoices collected. One supplier was closed, will return tomorrow.");

        var c2 = new Request(
            "Legal documents notarization",
            "Take company documents to notary for official certification.",
            michael.Id, tunis, PriorityLevel.High,
            DateTime.UtcNow.AddDays(-2), 50m);
        c2.Assign(courier2.Id);
        c2.Start();
        c2.Complete(50m, "Documents notarized and returned successfully.");
        c2.SubmitSurvey(5, "Very fast and professional service.");

        // ── Cancelled ──────────────────────────────────────────────────────────
        var cn1 = new Request(
            "Conference catering order",
            "Pick up catering order for client meeting at Lac office.",
            sarah.Id, lac, PriorityLevel.Normal,
            DateTime.UtcNow.AddDays(-1), 120m);
        cn1.Cancel("Meeting was postponed by the client.");

        // ── Persist ────────────────────────────────────────────────────────────
        context.Requests.AddRange(p1, p2, p3, a1, a2, ip1, ip2, c1, c2, cn1);
        await context.SaveChangesAsync();

        logger.LogInformation(
            "DbInitializer: seeded 10 requests and 4 demo users successfully.");
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private static async Task<ApplicationUser> EnsureUser(
        UserManager<ApplicationUser> userManager,
        string email,
        string fullName,
        string role)
    {
        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null) return existing;

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Email = email,
            UserName = email,
            EmailConfirmed = true,
            IsActive = true,
        };

        var result = await userManager.CreateAsync(user, DefaultPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                $"Failed to seed user {email}: " +
                string.Join(", ", result.Errors.Select(e => e.Description)));

        await userManager.AddToRoleAsync(user, role);
        return user;
    }
}