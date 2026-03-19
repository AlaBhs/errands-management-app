using ErrandsManagement.Domain.Common;
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
    private const string DefaultPassword = "Dev1234!";

    public static async Task SeedAsync(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        ILogger logger)
    {
        if (await context.Requests.AnyAsync())
        {
            logger.LogInformation("DbInitializer: requests already present, skipping.");
            return;
        }

        logger.LogInformation("DbInitializer: seeding demo data...");

        // ── Users ──────────────────────────────────────────────────────────────
        var sarah = await EnsureUser(userManager, "sarah.johnson@ey.local", "Sarah Johnson", "Collaborator");
        var michael = await EnsureUser(userManager, "michael.chen@ey.local", "Michael Chen", "Collaborator");
        var courier1 = await EnsureUser(userManager, "courier1@ey.local", "Ali Ben Salem", "Courier");
        var courier2 = await EnsureUser(userManager, "courier2@ey.local", "Karim Trabelsi", "Courier");

        // ── Addresses ─────────────────────────────────────────────────────────
        var tunis = new Address("Rue de la Liberté", "Tunis", "1001", "Tunisia");
        var lac = new Address("Rue du Lac Malaren", "Lac II", "1053", "Tunisia");
        var marsa = new Address("Avenue Habib Bourguiba", "La Marsa", "2070", "Tunisia");

        // ── Reflection helpers ────────────────────────────────────────────────

        static void SetCreatedAt(Request request, DateTime date)
        {
            var prop = typeof(BaseEntity).GetProperty(
                "CreatedAt",
                System.Reflection.BindingFlags.Public |
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Instance);
            prop!.SetValue(request, date);
        }

        // nullable completedAt — omit for in-progress requests
        static void SetAssignmentDates(
            Request request,
            DateTime startedAt,
            DateTime? completedAt = null)
        {
            var field = typeof(Request).GetField(
                "_assignments",
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Instance);

            var assignments = (List<Assignment>)field!.GetValue(request)!;
            var assignment = assignments.Last();

            var startedProp = typeof(Assignment).GetProperty(
                "StartedAt",
                System.Reflection.BindingFlags.Public |
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Instance);

            var completedProp = typeof(Assignment).GetProperty(
                "CompletedAt",
                System.Reflection.BindingFlags.Public |
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Instance);

            startedProp!.SetValue(assignment, startedAt);
            if (completedAt.HasValue)
                completedProp!.SetValue(assignment, completedAt.Value);
        }

        static void SetAuditLogDate(Request request, string eventType, DateTime date)
        {
            var field = typeof(Request).GetField(
                "_auditLogs",
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Instance);

            var auditLogs = (List<AuditLog>)field!.GetValue(request)!;
            var log = auditLogs.LastOrDefault(l => l.EventType == eventType);
            if (log is null) return;

            // Target the backing field directly — EF reads backing fields, not properties,
            // so SetValue on the property is ignored when EF serializes the entity.
            var backingField = typeof(AuditLog).GetField(
                "<OccurredAt>k__BackingField",
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Instance);

            backingField!.SetValue(log, date);
        }

        var now = DateTime.UtcNow;
        var m5 = now.AddMonths(-5);
        var m4 = now.AddMonths(-4);
        var m3 = now.AddMonths(-3);
        var m2 = now.AddMonths(-2);
        var m1 = now.AddMonths(-1);
        var m0 = now;

        // ══════════════════════════════════════════════════════════════════════
        // 5 MONTHS AGO — 2 completed (trend: 2)
        // ══════════════════════════════════════════════════════════════════════

        var h1 = new Request(
            "Office supplies procurement",
            "Need printer paper A4 x10 reams and ballpoint pens x50.",
            sarah.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Ahmed Ben Ali", "+216 71 234 567", "Please deliver before noon.",
            m5.AddDays(5), 45m);
        h1.Assign(courier1.Id);
        h1.Start();
        h1.Complete(42m, "Delivered on time.");
        h1.SubmitSurvey(4, "Good service, slight delay.");
        SetCreatedAt(h1, m5);
        SetAuditLogDate(h1, "Created", m5);
        SetAuditLogDate(h1, "Assigned", m5.AddHours(4));
        SetAuditLogDate(h1, "Started", m5.AddDays(1));
        SetAuditLogDate(h1, "Completed", m5.AddDays(1).AddMinutes(45));
        SetAssignmentDates(h1, m5.AddDays(1), m5.AddDays(1).AddMinutes(45));

        var h2 = new Request(
            "IT equipment pickup — HP laptop",
            "Pick up repaired laptop from HP service center.",
            michael.Id, lac, PriorityLevel.High, RequestCategory.ITEquipment,
            "Sonia Mejri", "+216 71 890 123", null,
            m5.AddDays(3), 0m);
        h2.Assign(courier2.Id);
        h2.Start();
        h2.Complete(15m, "Laptop collected and delivered to IT department.");
        h2.SubmitSurvey(5, "Excellent — very professional.");
        SetCreatedAt(h2, m5.AddDays(2));
        SetAuditLogDate(h2, "Created", m5.AddDays(2));
        SetAuditLogDate(h2, "Assigned", m5.AddDays(2).AddHours(6));
        SetAuditLogDate(h2, "Started", m5.AddDays(3));
        SetAuditLogDate(h2, "Completed", m5.AddDays(3).AddMinutes(90));
        SetAssignmentDates(h2, m5.AddDays(3), m5.AddDays(3).AddMinutes(90));

        // ══════════════════════════════════════════════════════════════════════
        // 4 MONTHS AGO — 2 completed, 1 cancelled (trend: 3)
        // ══════════════════════════════════════════════════════════════════════

        var h3 = new Request(
            "Travel booking documents",
            "Deliver flight itineraries and hotel vouchers to the client.",
            sarah.Id, marsa, PriorityLevel.Normal, RequestCategory.Travel,
            "Ahmed Mohamed", "+216 77 777 777", null,
            m4.AddDays(4), 25m);
        h3.Assign(courier1.Id);
        h3.Start();
        h3.Complete(20m, "Documents delivered successfully.");
        h3.SubmitSurvey(3, "Delivery was late by an hour.");
        SetCreatedAt(h3, m4);
        SetAuditLogDate(h3, "Created", m4);
        SetAuditLogDate(h3, "Assigned", m4.AddHours(2));
        SetAuditLogDate(h3, "Started", m4.AddDays(1));
        SetAuditLogDate(h3, "Completed", m4.AddDays(1).AddMinutes(60));
        SetAssignmentDates(h3, m4.AddDays(1), m4.AddDays(1).AddMinutes(60));

        var h4 = new Request(
            "Facilities inspection report",
            "Deliver printed inspection reports to building management.",
            michael.Id, tunis, PriorityLevel.Normal, RequestCategory.Facilities,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m4.AddDays(6), 10m);
        h4.Assign(courier2.Id);
        h4.Start();
        h4.Complete(10m, "Reports delivered and signed.");
        h4.SubmitSurvey(4, "Smooth process.");
        SetCreatedAt(h4, m4.AddDays(1));
        SetAuditLogDate(h4, "Created", m4.AddDays(1));
        SetAuditLogDate(h4, "Assigned", m4.AddDays(2).AddHours(9));
        SetAuditLogDate(h4, "Started", m4.AddDays(2).AddHours(10));
        SetAuditLogDate(h4, "Completed", m4.AddDays(2).AddHours(10).AddMinutes(30));
        SetAssignmentDates(h4, m4.AddDays(2).AddHours(10), m4.AddDays(2).AddHours(10).AddMinutes(30));

        var h5 = new Request(
            "Conference catering order",
            "Pick up catering order for client meeting.",
            sarah.Id, lac, PriorityLevel.Normal, RequestCategory.Other,
            "Sonia Mejri", "+216 71 890 123", null,
            m4.AddDays(2), 120m);
        h5.Cancel("Meeting was postponed by the client.");
        SetCreatedAt(h5, m4.AddDays(1));
        SetAuditLogDate(h5, "Created", m4.AddDays(1));
        SetAuditLogDate(h5, "Cancelled", m4.AddDays(1).AddHours(3));

        // ══════════════════════════════════════════════════════════════════════
        // 3 MONTHS AGO — 3 completed, 1 cancelled (trend: 4)
        // ══════════════════════════════════════════════════════════════════════

        var h6 = new Request(
            "Monthly invoice collection",
            "Collect invoices from 3 suppliers in La Marsa.",
            sarah.Id, marsa, PriorityLevel.Normal, RequestCategory.Other,
            "Ahmed Mohamed", "+216 77 777 777", null,
            m3.AddDays(3), 35m);
        h6.Assign(courier1.Id);
        h6.Start();
        h6.Complete(32m, "All invoices collected.");
        h6.SubmitSurvey(5, "Fast and reliable.");
        SetCreatedAt(h6, m3);
        SetAuditLogDate(h6, "Created", m3);
        SetAuditLogDate(h6, "Assigned", m3.AddHours(3));
        SetAuditLogDate(h6, "Started", m3.AddDays(1));
        SetAuditLogDate(h6, "Completed", m3.AddDays(1).AddMinutes(75));
        SetAssignmentDates(h6, m3.AddDays(1), m3.AddDays(1).AddMinutes(75));

        var h7 = new Request(
            "Legal documents notarization",
            "Take company documents to notary for official certification.",
            michael.Id, tunis, PriorityLevel.High, RequestCategory.Other,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m3.AddDays(5), 50m);
        h7.Assign(courier2.Id);
        h7.Start();
        h7.Complete(50m, "Documents notarized and returned.");
        h7.SubmitSurvey(4, "Professional and punctual.");
        SetCreatedAt(h7, m3.AddDays(1));
        SetAuditLogDate(h7, "Created", m3.AddDays(1));
        SetAuditLogDate(h7, "Assigned", m3.AddDays(1).AddHours(8));
        SetAuditLogDate(h7, "Started", m3.AddDays(2));
        SetAuditLogDate(h7, "Completed", m3.AddDays(2).AddMinutes(120));
        SetAssignmentDates(h7, m3.AddDays(2), m3.AddDays(2).AddMinutes(120));

        var h8 = new Request(
            "IT peripherals order",
            "Purchase keyboards and mice from tech store and deliver.",
            sarah.Id, lac, PriorityLevel.Normal, RequestCategory.ITEquipment,
            "Sonia Mejri", "+216 71 890 123", null,
            m3.AddDays(4), 180m);
        h8.Assign(courier1.Id);
        h8.Start();
        h8.Complete(165m, "All items delivered, one keyboard substituted.");
        h8.SubmitSurvey(4, "Good problem solving.");
        SetCreatedAt(h8, m3.AddDays(2));
        SetAuditLogDate(h8, "Created", m3.AddDays(2));
        SetAuditLogDate(h8, "Assigned", m3.AddDays(2).AddHours(1));
        SetAuditLogDate(h8, "Started", m3.AddDays(2).AddHours(4));
        SetAuditLogDate(h8, "Completed", m3.AddDays(3).AddMinutes(150));
        SetAssignmentDates(h8, m3.AddDays(2).AddHours(4), m3.AddDays(3).AddMinutes(150));

        var h9 = new Request(
            "Cancelled travel voucher run",
            "Deliver updated travel vouchers to airport liaison.",
            michael.Id, tunis, PriorityLevel.High, RequestCategory.Travel,
            "Ahmed Mohamed", "+216 77 777 777", null,
            m3.AddDays(2), 30m);
        h9.Cancel("Flight was rescheduled — vouchers no longer needed.");
        SetCreatedAt(h9, m3.AddDays(1));
        SetAuditLogDate(h9, "Created", m3.AddDays(1));
        SetAuditLogDate(h9, "Cancelled", m3.AddDays(1).AddHours(5));

        // ══════════════════════════════════════════════════════════════════════
        // 2 MONTHS AGO — 3 completed (trend: 3)
        // ══════════════════════════════════════════════════════════════════════

        var h10 = new Request(
            "Customs clearance documents",
            "Deliver customs clearance paperwork to port authority.",
            michael.Id, tunis, PriorityLevel.Urgent, RequestCategory.Other,
            "Ahmed Mohamed", "+216 77 777 777", null,
            m2.AddDays(1), null);
        h10.Assign(courier2.Id);
        h10.Start();
        h10.Complete(null, "Paperwork submitted. Awaiting port authority confirmation.");
        h10.SubmitSurvey(2, "Too slow — urgent request took almost a full day.");
        SetCreatedAt(h10, m2);
        SetAuditLogDate(h10, "Created", m2);
        SetAuditLogDate(h10, "Assigned", m2.AddHours(1));
        SetAuditLogDate(h10, "Started", m2.AddDays(1));
        SetAuditLogDate(h10, "Completed", m2.AddDays(1).AddMinutes(240));
        SetAssignmentDates(h10, m2.AddDays(1), m2.AddDays(1).AddMinutes(240));

        var h11 = new Request(
            "Office furniture delivery coordination",
            "Coordinate delivery of new chairs from warehouse to Lac office.",
            sarah.Id, lac, PriorityLevel.Normal, RequestCategory.Facilities,
            "Sonia Mejri", "+216 71 890 123", null,
            m2.AddDays(4), 200m);
        h11.Assign(courier1.Id);
        h11.Start();
        h11.Complete(195m, "Furniture delivered and arranged.");
        h11.SubmitSurvey(5, "Great coordination, zero issues.");
        SetCreatedAt(h11, m2.AddDays(1));
        SetAuditLogDate(h11, "Created", m2.AddDays(1));
        SetAuditLogDate(h11, "Assigned", m2.AddDays(2).AddHours(8));
        SetAuditLogDate(h11, "Started", m2.AddDays(2).AddHours(9));
        SetAuditLogDate(h11, "Completed", m2.AddDays(2).AddHours(9).AddMinutes(180));
        SetAssignmentDates(h11, m2.AddDays(2).AddHours(9), m2.AddDays(2).AddHours(9).AddMinutes(180));

        var h12 = new Request(
            "Courier to Ministry of Finance",
            "Deliver official correspondence to Ministry of Finance.",
            sarah.Id, tunis, PriorityLevel.High, RequestCategory.Facilities,
            "Ahmed Ben Ali", "+216 71 234 567", "Please deliver between 5-6 PM.",
            m2.AddDays(3), 15m);
        h12.Assign(courier2.Id);
        h12.Start();
        h12.Complete(15m, "Delivered and signed for.");
        // Intentionally no survey
        SetCreatedAt(h12, m2.AddDays(2));
        SetAuditLogDate(h12, "Created", m2.AddDays(2));
        SetAuditLogDate(h12, "Assigned", m2.AddDays(2).AddHours(5));
        SetAuditLogDate(h12, "Started", m2.AddDays(2).AddHours(5).AddMinutes(30));
        SetAuditLogDate(h12, "Completed", m2.AddDays(2).AddHours(5).AddMinutes(65));
        SetAssignmentDates(h12, m2.AddDays(2).AddHours(5).AddMinutes(30),
                                          m2.AddDays(2).AddHours(5).AddMinutes(65));

        // ══════════════════════════════════════════════════════════════════════
        // 1 MONTH AGO — 2 completed, 1 assigned, 1 pending (trend: 4)
        // ══════════════════════════════════════════════════════════════════════

        var h13 = new Request(
            "Bank document collection — STB Lac",
            "Collect certified bank statements from STB Lac branch.",
            michael.Id, lac, PriorityLevel.High, RequestCategory.Other,
            "Sonia Mejri", "+216 71 890 123", "Please deliver between 5-6 PM.",
            m1.AddDays(3), 20m);
        h13.Assign(courier1.Id);
        h13.Start();
        h13.Complete(18m, "Statements collected without issues.");
        h13.SubmitSurvey(5, "Excellent service as always.");
        SetCreatedAt(h13, m1);
        SetAuditLogDate(h13, "Created", m1);
        SetAuditLogDate(h13, "Assigned", m1.AddHours(2));
        SetAuditLogDate(h13, "Started", m1.AddDays(1));
        SetAuditLogDate(h13, "Completed", m1.AddDays(1).AddMinutes(50));
        SetAssignmentDates(h13, m1.AddDays(1), m1.AddDays(1).AddMinutes(50));

        var h14 = new Request(
            "Travel booking — executive trip",
            "Deliver confirmed executive travel pack to GM office.",
            sarah.Id, tunis, PriorityLevel.Urgent, RequestCategory.Travel,
            "Ahmed Mohamed", "+216 77 777 777", null,
            m1.AddDays(2), 60m);
        h14.Assign(courier2.Id);
        h14.Start();
        h14.Complete(55m, "Travel pack delivered and acknowledged.");
        h14.SubmitSurvey(4, "Fast but the courier called twice to confirm address.");
        SetCreatedAt(h14, m1.AddDays(1));
        SetAuditLogDate(h14, "Created", m1.AddDays(1));
        SetAuditLogDate(h14, "Assigned", m1.AddDays(1).AddMinutes(30));
        SetAuditLogDate(h14, "Started", m1.AddDays(1).AddHours(2));
        SetAuditLogDate(h14, "Completed", m1.AddDays(1).AddHours(2).AddMinutes(65));
        SetAssignmentDates(h14, m1.AddDays(1).AddHours(2),
                                          m1.AddDays(1).AddHours(2).AddMinutes(65));

        var h15 = new Request(
            "Stationery restocking",
            "Purchase and deliver stationery from Papeterie Centrale.",
            sarah.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m1.AddDays(5), 80m);
        h15.Assign(courier1.Id);
        // Assigned — not yet started
        SetCreatedAt(h15, m1.AddDays(2));
        SetAuditLogDate(h15, "Created", m1.AddDays(2));
        SetAuditLogDate(h15, "Assigned", m1.AddDays(2).AddHours(6));

        var h16 = new Request(
            "Document delivery to notary",
            "Urgent delivery of signed contracts to Maître Ben Ali office.",
            michael.Id, tunis, PriorityLevel.Urgent, RequestCategory.Other,
            "Sonia Mejri", "+216 71 890 123", null,
            m1.AddDays(4), 30m);
        // Pending
        SetCreatedAt(h16, m1.AddDays(3));
        SetAuditLogDate(h16, "Created", m1.AddDays(3));

        // ══════════════════════════════════════════════════════════════════════
        // CURRENT MONTH — 1 completed, 1 in-progress, 2 pending (trend: 4)
        // ══════════════════════════════════════════════════════════════════════

        var h17 = new Request(
            "IT equipment pickup — Dell monitors",
            "Pick up 4 Dell monitors from supplier and deliver to IT room.",
            sarah.Id, lac, PriorityLevel.High, RequestCategory.ITEquipment,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m0.AddDays(3), 320m);
        h17.Assign(courier2.Id);
        h17.Start();
        h17.Complete(310m, "Monitors delivered and tested by IT team.");
        h17.SubmitSurvey(5, "Perfect execution.");
        SetCreatedAt(h17, m0.AddDays(-6));
        SetAuditLogDate(h17, "Created", m0.AddDays(-6));
        SetAuditLogDate(h17, "Assigned", m0.AddDays(-5));
        SetAuditLogDate(h17, "Started", m0.AddDays(-5).AddHours(3));
        SetAuditLogDate(h17, "Completed", m0.AddDays(-5).AddHours(3).AddMinutes(110));
        SetAssignmentDates(h17, m0.AddDays(-5).AddHours(3),
                                          m0.AddDays(-5).AddHours(3).AddMinutes(110));

        var h18 = new Request(
            "Office supplies — toner cartridges",
            "Purchase toner cartridges for 3rd floor printers.",
            michael.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Sonia Mejri", "+216 71 890 123", null,
            m0.AddDays(4), 95m);
        h18.Assign(courier1.Id);
        h18.Start();
        // InProgress — no CompletedAt
        SetCreatedAt(h18, m0.AddDays(-4));
        SetAuditLogDate(h18, "Created", m0.AddDays(-4));
        SetAuditLogDate(h18, "Assigned", m0.AddDays(-3).AddHours(10));
        SetAuditLogDate(h18, "Started", m0.AddDays(-3).AddHours(11));
        SetAssignmentDates(h18, m0.AddDays(-3).AddHours(11)); // no completedAt

        var h19 = new Request(
            "Facilities permit renewal",
            "Deliver permit renewal application to municipal office.",
            sarah.Id, tunis, PriorityLevel.Normal, RequestCategory.Facilities,
            "Ahmed Mohamed", "+216 77 777 777",
            "Ask for the permits desk on the 2nd floor.",
            m0.AddDays(5), 0m);
        // Pending
        SetCreatedAt(h19, m0.AddDays(-2));
        SetAuditLogDate(h19, "Created", m0.AddDays(-2));

        var h20 = new Request(
            "Travel documents — visa application",
            "Deliver passport and supporting documents to French consulate.",
            michael.Id, marsa, PriorityLevel.Urgent, RequestCategory.Travel,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m0.AddDays(2), 40m);
        // Pending
        SetCreatedAt(h20, m0.AddDays(-1));
        SetAuditLogDate(h20, "Created", m0.AddDays(-1));

        // ── Persist ────────────────────────────────────────────────────────────
        var all = new[]
        {
            h1,  h2,  h3,  h4,  h5,  h6,  h7,  h8,  h9,  h10,
            h11, h12, h13, h14, h15, h16, h17, h18, h19, h20
        };

        foreach (var request in all)
        {
            context.ChangeTracker.Clear();
            await context.Requests.AddAsync(request);
            await context.SaveChangesAsync();
        }

        logger.LogInformation(
            "DbInitializer: seeded {Count} requests across 6 months with full analytics coverage.",
            all.Length);
    }

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