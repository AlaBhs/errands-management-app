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
        var courier1 = await EnsureUser(userManager, "courier1@ey.local", "Ali Ben Salem", "Courier",
            latitude: 36.8320, longitude: 10.2300, city: "Lac");
        var courier2 = await EnsureUser(userManager, "courier2@ey.local", "Karim Trabelsi", "Courier",
            latitude: 36.8781, longitude: 10.3248, city: "La Marsa");

        // ── Addresses ─────────────────────────────────────────────────────────
        var tunis = new Address("Rue de la Liberté", "Tunis", "1001", "Tunisia",
            latitude: 36.8065, longitude: 10.1815);

        var lac = new Address("Rue du Lac Malaren", "Lac II", "1053", "Tunisia",
            latitude: 36.8320, longitude: 10.2300);

        var marsa = new Address("Avenue Habib Bourguiba", "La Marsa", "2070", "Tunisia",
            latitude: 36.8781, longitude: 10.3248);

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



        // ══════════════════════════════════════════════════════════════════════
        // ADDITIONAL DATA — richer filter coverage
        // ══════════════════════════════════════════════════════════════════════

        // ── 5 MONTHS AGO — 2 more (trend: 4 total) ───────────────────────────

        var h21 = new Request(
            "Legal contracts delivery",
            "Deliver signed legal contracts to law firm downtown.",
            michael.Id, tunis, PriorityLevel.High, RequestCategory.Other,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m5.AddDays(6), 40m);
        h21.Assign(courier2.Id);
        h21.Start();
        h21.Complete(38m, "Contracts delivered and signed for.");
        h21.SubmitSurvey(5, "Punctual and professional.");
        SetCreatedAt(h21, m5.AddDays(3));
        SetAuditLogDate(h21, "Created", m5.AddDays(3));
        SetAuditLogDate(h21, "Assigned", m5.AddDays(3).AddHours(3));
        SetAuditLogDate(h21, "Started", m5.AddDays(4));
        SetAuditLogDate(h21, "Completed", m5.AddDays(4).AddMinutes(38));
        SetAssignmentDates(h21, m5.AddDays(4), m5.AddDays(4).AddMinutes(38));

        var h22 = new Request(
            "Travel visa documents pickup",
            "Pick up visa application documents from travel agency.",
            sarah.Id, marsa, PriorityLevel.Urgent, RequestCategory.Travel,
            "Sonia Mejri", "+216 71 890 123", null,
            m5.AddDays(4), 55m);
        h22.Assign(courier1.Id);
        h22.Start();
        h22.Complete(50m, "Documents picked up and delivered.");
        h22.SubmitSurvey(4, "Quick turnaround on urgent request.");
        SetCreatedAt(h22, m5.AddDays(3));
        SetAuditLogDate(h22, "Created", m5.AddDays(3));
        SetAuditLogDate(h22, "Assigned", m5.AddDays(3).AddHours(1));
        SetAuditLogDate(h22, "Started", m5.AddDays(3).AddHours(3));
        SetAuditLogDate(h22, "Completed", m5.AddDays(3).AddHours(3).AddMinutes(50));
        SetAssignmentDates(h22, m5.AddDays(3).AddHours(3),
                                m5.AddDays(3).AddHours(3).AddMinutes(50));

        // ── 4 MONTHS AGO — 3 more (trend: 6 total) ───────────────────────────

        var h23 = new Request(
            "IT server room access card",
            "Deliver new access cards to IT department from HR office.",
            michael.Id, lac, PriorityLevel.Normal, RequestCategory.ITEquipment,
            "Ahmed Mohamed", "+216 77 777 777", null,
            m4.AddDays(5), 0m);
        h23.Assign(courier1.Id);
        h23.Start();
        h23.Complete(null, "Access cards delivered to IT manager.");
        h23.SubmitSurvey(3, "Took longer than expected.");
        SetCreatedAt(h23, m4.AddDays(2));
        SetAuditLogDate(h23, "Created", m4.AddDays(2));
        SetAuditLogDate(h23, "Assigned", m4.AddDays(2).AddHours(5));
        SetAuditLogDate(h23, "Started", m4.AddDays(3));
        SetAuditLogDate(h23, "Completed", m4.AddDays(3).AddMinutes(120));
        SetAssignmentDates(h23, m4.AddDays(3), m4.AddDays(3).AddMinutes(120));

        var h24 = new Request(
            "Office renovation supplies",
            "Purchase paint and brushes from hardware store for office renovation.",
            sarah.Id, tunis, PriorityLevel.Normal, RequestCategory.Facilities,
            "Ahmed Ben Ali", "+216 71 234 567",
            "Ask for water-based paint only.",
            m4.AddDays(7), 150m);
        h24.Assign(courier2.Id);
        h24.Start();
        h24.Complete(145m, "All renovation supplies delivered.");
        h24.SubmitSurvey(5, "Exactly what was requested, great job.");
        SetCreatedAt(h24, m4.AddDays(3));
        SetAuditLogDate(h24, "Created", m4.AddDays(3));
        SetAuditLogDate(h24, "Assigned", m4.AddDays(3).AddHours(4));
        SetAuditLogDate(h24, "Started", m4.AddDays(4));
        SetAuditLogDate(h24, "Completed", m4.AddDays(4).AddMinutes(95));
        SetAssignmentDates(h24, m4.AddDays(4), m4.AddDays(4).AddMinutes(95));

        var h25 = new Request(
            "Cancelled IT equipment order",
            "Pick up external hard drives from electronics store.",
            michael.Id, lac, PriorityLevel.Normal, RequestCategory.ITEquipment,
            "Sonia Mejri", "+216 71 890 123", null,
            m4.AddDays(4), 200m);
        h25.Cancel("Order was cancelled — items found in storage.");
        SetCreatedAt(h25, m4.AddDays(3));
        SetAuditLogDate(h25, "Created", m4.AddDays(3));
        SetAuditLogDate(h25, "Cancelled", m4.AddDays(3).AddHours(2));

        // ── 3 MONTHS AGO — 3 more (trend: 7 total) ───────────────────────────

        var h26 = new Request(
            "Payroll documents delivery",
            "Deliver payroll summary documents to finance department.",
            sarah.Id, tunis, PriorityLevel.High, RequestCategory.Other,
            "Ahmed Mohamed", "+216 77 777 777", null,
            m3.AddDays(4), 25m);
        h26.Assign(courier2.Id);
        h26.Start();
        h26.Complete(22m, "Documents delivered and acknowledged.");
        h26.SubmitSurvey(4, "Fast and discreet handling of sensitive documents.");
        SetCreatedAt(h26, m3.AddDays(2));
        SetAuditLogDate(h26, "Created", m3.AddDays(2));
        SetAuditLogDate(h26, "Assigned", m3.AddDays(2).AddHours(2));
        SetAuditLogDate(h26, "Started", m3.AddDays(3));
        SetAuditLogDate(h26, "Completed", m3.AddDays(3).AddMinutes(22));
        SetAssignmentDates(h26, m3.AddDays(3), m3.AddDays(3).AddMinutes(22));

        var h27 = new Request(
            "Office supplies — ergonomic accessories",
            "Purchase wrist rests and monitor stands for engineering team.",
            michael.Id, lac, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m3.AddDays(6), 120m);
        h27.Assign(courier1.Id);
        h27.Start();
        h27.Complete(115m, "All accessories delivered and distributed.");
        // No survey — tests null avg
        SetCreatedAt(h27, m3.AddDays(3));
        SetAuditLogDate(h27, "Created", m3.AddDays(3));
        SetAuditLogDate(h27, "Assigned", m3.AddDays(3).AddHours(6));
        SetAuditLogDate(h27, "Started", m3.AddDays(4));
        SetAuditLogDate(h27, "Completed", m3.AddDays(4).AddMinutes(115));
        SetAssignmentDates(h27, m3.AddDays(4), m3.AddDays(4).AddMinutes(115));

        var h28 = new Request(
            "Flight booking confirmation delivery",
            "Deliver printed flight confirmations to executive assistant.",
            sarah.Id, marsa, PriorityLevel.Urgent, RequestCategory.Travel,
            "Sonia Mejri", "+216 71 890 123", null,
            m3.AddDays(3), 30m);
        h28.Assign(courier2.Id);
        h28.Start();
        h28.Complete(28m, "Confirmations delivered before deadline.");
        h28.SubmitSurvey(5, "Arrived 30 minutes early — excellent.");
        SetCreatedAt(h28, m3.AddDays(2));
        SetAuditLogDate(h28, "Created", m3.AddDays(2));
        SetAuditLogDate(h28, "Assigned", m3.AddDays(2).AddHours(1));
        SetAuditLogDate(h28, "Started", m3.AddDays(2).AddHours(2));
        SetAuditLogDate(h28, "Completed", m3.AddDays(2).AddHours(2).AddMinutes(28));
        SetAssignmentDates(h28, m3.AddDays(2).AddHours(2),
                                m3.AddDays(2).AddHours(2).AddMinutes(28));

        // ── 2 MONTHS AGO — 3 more (trend: 6 total) ───────────────────────────

        var h29 = new Request(
            "HVAC maintenance coordination",
            "Deliver maintenance order forms to facilities team at Lac office.",
            michael.Id, lac, PriorityLevel.Normal, RequestCategory.Facilities,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m2.AddDays(5), 10m);
        h29.Assign(courier1.Id);
        h29.Start();
        h29.Complete(10m, "Forms delivered and signed.");
        h29.SubmitSurvey(4, "Reliable as always.");
        SetCreatedAt(h29, m2.AddDays(2));
        SetAuditLogDate(h29, "Created", m2.AddDays(2));
        SetAuditLogDate(h29, "Assigned", m2.AddDays(2).AddHours(3));
        SetAuditLogDate(h29, "Started", m2.AddDays(3));
        SetAuditLogDate(h29, "Completed", m2.AddDays(3).AddMinutes(40));
        SetAssignmentDates(h29, m2.AddDays(3), m2.AddDays(3).AddMinutes(40));

        var h30 = new Request(
            "Printer cartridges emergency order",
            "Urgent purchase of ink cartridges — printer down on deadline day.",
            sarah.Id, tunis, PriorityLevel.Urgent, RequestCategory.OfficeSupplies,
            "Ahmed Mohamed", "+216 77 777 777",
            "Must be HP 305XL black — no substitutes.",
            m2.AddDays(2), 75m);
        h30.Assign(courier2.Id);
        h30.Start();
        h30.Complete(72m, "Correct cartridges found and delivered.");
        h30.SubmitSurvey(5, "Saved the day — printer back up within the hour.");
        SetCreatedAt(h30, m2.AddDays(2));
        SetAuditLogDate(h30, "Created", m2.AddDays(2));
        SetAuditLogDate(h30, "Assigned", m2.AddDays(2).AddHours(1));
        SetAuditLogDate(h30, "Started", m2.AddDays(2).AddHours(1).AddMinutes(30));
        SetAuditLogDate(h30, "Completed", m2.AddDays(2).AddHours(1).AddMinutes(30).AddMinutes(55));
        SetAssignmentDates(h30, m2.AddDays(2).AddHours(1).AddMinutes(30),
                                m2.AddDays(2).AddHours(1).AddMinutes(30).AddMinutes(55));

        var h31 = new Request(
            "Cancelled facilities inspection",
            "Coordinate external inspector visit to rooftop facilities.",
            michael.Id, tunis, PriorityLevel.Normal, RequestCategory.Facilities,
            "Sonia Mejri", "+216 71 890 123", null,
            m2.AddDays(6), 0m);
        h31.Cancel("Inspector was unavailable — rescheduled for next month.");
        SetCreatedAt(h31, m2.AddDays(3));
        SetAuditLogDate(h31, "Created", m2.AddDays(3));
        SetAuditLogDate(h31, "Cancelled", m2.AddDays(3).AddHours(4));

        // ── 1 MONTH AGO — 3 more (trend: 7 total) ────────────────────────────

        var h32 = new Request(
            "IT equipment — standing desk cables",
            "Purchase cable management kits and HDMI cables for new standing desks.",
            sarah.Id, lac, PriorityLevel.Normal, RequestCategory.ITEquipment,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m1.AddDays(6), 85m);
        h32.Assign(courier1.Id);
        h32.Start();
        h32.Complete(80m, "All cables and kits delivered.");
        h32.SubmitSurvey(4, "Good job, minor delay finding parking.");
        SetCreatedAt(h32, m1.AddDays(3));
        SetAuditLogDate(h32, "Created", m1.AddDays(3));
        SetAuditLogDate(h32, "Assigned", m1.AddDays(3).AddHours(4));
        SetAuditLogDate(h32, "Started", m1.AddDays(4));
        SetAuditLogDate(h32, "Completed", m1.AddDays(4).AddMinutes(80));
        SetAssignmentDates(h32, m1.AddDays(4), m1.AddDays(4).AddMinutes(80));

        var h33 = new Request(
            "Travel insurance documents",
            "Collect travel insurance certificates from broker office.",
            michael.Id, marsa, PriorityLevel.High, RequestCategory.Travel,
            "Ahmed Mohamed", "+216 77 777 777", null,
            m1.AddDays(5), 20m);
        h33.Assign(courier2.Id);
        h33.Start();
        h33.Complete(18m, "Certificates collected and delivered to HR.");
        h33.SubmitSurvey(5, "Very efficient.");
        SetCreatedAt(h33, m1.AddDays(3));
        SetAuditLogDate(h33, "Created", m1.AddDays(3));
        SetAuditLogDate(h33, "Assigned", m1.AddDays(3).AddHours(2));
        SetAuditLogDate(h33, "Started", m1.AddDays(4));
        SetAuditLogDate(h33, "Completed", m1.AddDays(4).AddMinutes(18));
        SetAssignmentDates(h33, m1.AddDays(4), m1.AddDays(4).AddMinutes(18));

        var h34 = new Request(
            "Office cleaning supplies",
            "Purchase cleaning products for weekly office cleaning.",
            sarah.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Sonia Mejri", "+216 71 890 123", null,
            m1.AddDays(7), 60m);
        h34.Assign(courier1.Id);
        h34.Start();
        h34.Complete(55m, "All cleaning products delivered to facilities room.");
        h34.SubmitSurvey(3, "Correct items but delivery was later than expected.");
        SetCreatedAt(h34, m1.AddDays(4));
        SetAuditLogDate(h34, "Created", m1.AddDays(4));
        SetAuditLogDate(h34, "Assigned", m1.AddDays(4).AddHours(7));
        SetAuditLogDate(h34, "Started", m1.AddDays(5));
        SetAuditLogDate(h34, "Completed", m1.AddDays(5).AddMinutes(55));
        SetAssignmentDates(h34, m1.AddDays(5), m1.AddDays(5).AddMinutes(55));

        // ── CURRENT MONTH — 5 more (trend: 9 total) ──────────────────────────

        var h35 = new Request(
            "Urgent contract signing — notary",
            "Deliver corporate merger documents to notary for same-day signing.",
            michael.Id, tunis, PriorityLevel.Urgent, RequestCategory.Other,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m0.AddDays(1), 70m);
        h35.Assign(courier2.Id);
        h35.Start();
        h35.Complete(65m, "Documents signed and returned to legal team.");
        h35.SubmitSurvey(5, "Critical request handled perfectly under pressure.");
        SetCreatedAt(h35, m0.AddDays(-8));
        SetAuditLogDate(h35, "Created", m0.AddDays(-8));
        SetAuditLogDate(h35, "Assigned", m0.AddDays(-8).AddHours(1));
        SetAuditLogDate(h35, "Started", m0.AddDays(-8).AddHours(2));
        SetAuditLogDate(h35, "Completed", m0.AddDays(-8).AddHours(2).AddMinutes(65));
        SetAssignmentDates(h35, m0.AddDays(-8).AddHours(2),
                                m0.AddDays(-8).AddHours(2).AddMinutes(65));

        var h36 = new Request(
            "Office supplies — whiteboard markers",
            "Purchase whiteboard markers and erasers for all meeting rooms.",
            sarah.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Ahmed Mohamed", "+216 77 777 777", null,
            m0.AddDays(4), 35m);
        h36.Assign(courier1.Id);
        h36.Start();
        h36.Complete(30m, "Markers and erasers distributed to all meeting rooms.");
        h36.SubmitSurvey(4, "Quick and efficient.");
        SetCreatedAt(h36, m0.AddDays(-7));
        SetAuditLogDate(h36, "Created", m0.AddDays(-7));
        SetAuditLogDate(h36, "Assigned", m0.AddDays(-7).AddHours(3));
        SetAuditLogDate(h36, "Started", m0.AddDays(-6));
        SetAuditLogDate(h36, "Completed", m0.AddDays(-6).AddMinutes(30));
        SetAssignmentDates(h36, m0.AddDays(-6), m0.AddDays(-6).AddMinutes(30));

        var h37 = new Request(
            "Facilities — fire extinguisher inspection",
            "Coordinate fire extinguisher inspection with safety vendor.",
            michael.Id, lac, PriorityLevel.High, RequestCategory.Facilities,
            "Sonia Mejri", "+216 71 890 123",
            "Vendor requires building manager present.",
            m0.AddDays(5), 0m);
        h37.Assign(courier2.Id);
        h37.Start();
        // InProgress — second in-progress request this month
        SetCreatedAt(h37, m0.AddDays(-5));
        SetAuditLogDate(h37, "Created", m0.AddDays(-5));
        SetAuditLogDate(h37, "Assigned", m0.AddDays(-4).AddHours(9));
        SetAuditLogDate(h37, "Started", m0.AddDays(-4).AddHours(10));
        SetAssignmentDates(h37, m0.AddDays(-4).AddHours(10));

        var h38 = new Request(
            "IT equipment — USB hubs procurement",
            "Purchase 10 USB-C hubs for the new hot-desk area.",
            sarah.Id, lac, PriorityLevel.Normal, RequestCategory.ITEquipment,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            m0.AddDays(6), 250m);
        // Assigned — not yet started
        h38.Assign(courier1.Id);
        SetCreatedAt(h38, m0.AddDays(-3));
        SetAuditLogDate(h38, "Created", m0.AddDays(-3));
        SetAuditLogDate(h38, "Assigned", m0.AddDays(-3).AddHours(5));

        var h39 = new Request(
            "Travel booking — team offsite",
            "Deliver hotel and transport vouchers for team offsite event.",
            michael.Id, marsa, PriorityLevel.High, RequestCategory.Travel,
            "Ahmed Mohamed", "+216 77 777 777", null,
            m0.AddDays(3), 180m);
        // Pending — high value pending request
        SetCreatedAt(h39, m0.AddDays(-1));
        SetAuditLogDate(h39, "Created", m0.AddDays(-1));

        var h40 = new Request(
            "Office supplies — paper shredder bags",
            "Purchase shredder bags compatible with Fellowes shredder model 79CI.",
            sarah.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Sonia Mejri", "+216 71 890 123",
            "Must be cross-cut compatible bags.",
            m0.AddDays(4), 25m);
        // Pending
        SetCreatedAt(h40, m0.AddDays(-1));
        SetAuditLogDate(h40, "Created", m0.AddDays(-1));



        // ══════════════════════════════════════════════════════════════════════
        // 2024 — OLDER HISTORICAL DATA (makes All time vs Last 6 months differ)
        // ══════════════════════════════════════════════════════════════════════

        var y2024_jan = new DateTime(2024, 1, 15, 9, 0, 0, DateTimeKind.Utc);
        var y2024_feb = new DateTime(2024, 2, 10, 9, 0, 0, DateTimeKind.Utc);
        var y2024_mar = new DateTime(2024, 3, 5, 9, 0, 0, DateTimeKind.Utc);
        var y2024_apr = new DateTime(2024, 4, 12, 9, 0, 0, DateTimeKind.Utc);
        var y2024_may = new DateTime(2024, 5, 20, 9, 0, 0, DateTimeKind.Utc);
        var y2024_jun = new DateTime(2024, 6, 3, 9, 0, 0, DateTimeKind.Utc);
        var y2024_jul = new DateTime(2024, 7, 18, 9, 0, 0, DateTimeKind.Utc);
        var y2024_aug = new DateTime(2024, 8, 7, 9, 0, 0, DateTimeKind.Utc);
        var y2024_sep = new DateTime(2024, 9, 22, 9, 0, 0, DateTimeKind.Utc);
        var y2024_oct = new DateTime(2024, 10, 8, 9, 0, 0, DateTimeKind.Utc);
        var y2024_nov = new DateTime(2024, 11, 14, 9, 0, 0, DateTimeKind.Utc);
        var y2024_dec = new DateTime(2024, 12, 19, 9, 0, 0, DateTimeKind.Utc);

        // ── Jan 2024 ──────────────────────────────────────────────────────────
        var o1 = new Request(
            "Annual office supplies restocking",
            "Purchase full year stock of printer paper, pens, and folders.",
            sarah.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            y2024_jan.AddDays(3), 350m);
        o1.Assign(courier1.Id);
        o1.Start();
        o1.Complete(320m, "Full stock delivered and stored in supply room.");
        o1.SubmitSurvey(5, "Excellent handling of a large order.");
        SetCreatedAt(o1, y2024_jan);
        SetAuditLogDate(o1, "Created", y2024_jan);
        SetAuditLogDate(o1, "Assigned", y2024_jan.AddHours(5));
        SetAuditLogDate(o1, "Started", y2024_jan.AddDays(1));
        SetAuditLogDate(o1, "Completed", y2024_jan.AddDays(1).AddMinutes(200));
        SetAssignmentDates(o1, y2024_jan.AddDays(1),
                               y2024_jan.AddDays(1).AddMinutes(200));

        // ── Feb 2024 ──────────────────────────────────────────────────────────
        var o2 = new Request(
            "IT equipment — laptop battery replacements",
            "Purchase replacement batteries for 5 laptops from authorized vendor.",
            michael.Id, lac, PriorityLevel.High, RequestCategory.ITEquipment,
            "Sonia Mejri", "+216 71 890 123", null,
            y2024_feb.AddDays(2), 280m);
        o2.Assign(courier2.Id);
        o2.Start();
        o2.Complete(265m, "All batteries replaced successfully.");
        o2.SubmitSurvey(4, "Good service, took slightly longer than estimated.");
        SetCreatedAt(o2, y2024_feb);
        SetAuditLogDate(o2, "Created", y2024_feb);
        SetAuditLogDate(o2, "Assigned", y2024_feb.AddHours(3));
        SetAuditLogDate(o2, "Started", y2024_feb.AddDays(1));
        SetAuditLogDate(o2, "Completed", y2024_feb.AddDays(1).AddMinutes(150));
        SetAssignmentDates(o2, y2024_feb.AddDays(1),
                               y2024_feb.AddDays(1).AddMinutes(150));

        // ── Mar 2024 ──────────────────────────────────────────────────────────
        var o3 = new Request(
            "Travel — Q1 executive trip documents",
            "Deliver Q1 travel itineraries and insurance documents to executives.",
            sarah.Id, marsa, PriorityLevel.Urgent, RequestCategory.Travel,
            "Ahmed Mohamed", "+216 77 777 777", null,
            y2024_mar.AddDays(1), 90m);
        o3.Assign(courier1.Id);
        o3.Start();
        o3.Complete(85m, "All executive travel documents delivered.");
        o3.SubmitSurvey(5, "Fast and professional — critical delivery.");
        SetCreatedAt(o3, y2024_mar);
        SetAuditLogDate(o3, "Created", y2024_mar);
        SetAuditLogDate(o3, "Assigned", y2024_mar.AddHours(1));
        SetAuditLogDate(o3, "Started", y2024_mar.AddHours(3));
        SetAuditLogDate(o3, "Completed", y2024_mar.AddHours(3).AddMinutes(85));
        SetAssignmentDates(o3, y2024_mar.AddHours(3),
                               y2024_mar.AddHours(3).AddMinutes(85));

        var o4 = new Request(
            "Facilities — building permit renewal",
            "Submit building permit renewal application to municipality.",
            michael.Id, tunis, PriorityLevel.High, RequestCategory.Facilities,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            y2024_mar.AddDays(5), 0m);
        o4.Cancel("Permit renewal handled directly by legal team.");
        SetCreatedAt(o4, y2024_mar.AddDays(2));
        SetAuditLogDate(o4, "Created", y2024_mar.AddDays(2));
        SetAuditLogDate(o4, "Cancelled", y2024_mar.AddDays(2).AddHours(6));

        // ── Apr 2024 ──────────────────────────────────────────────────────────
        var o5 = new Request(
            "Office furniture — reception chairs",
            "Purchase 4 reception chairs from furniture showroom.",
            sarah.Id, lac, PriorityLevel.Normal, RequestCategory.Facilities,
            "Sonia Mejri", "+216 71 890 123",
            "Must match existing navy blue color scheme.",
            y2024_apr.AddDays(4), 480m);
        o5.Assign(courier2.Id);
        o5.Start();
        o5.Complete(460m, "Chairs delivered and assembled in reception area.");
        o5.SubmitSurvey(4, "Heavy items handled well, slight scratch on one chair.");
        SetCreatedAt(o5, y2024_apr);
        SetAuditLogDate(o5, "Created", y2024_apr);
        SetAuditLogDate(o5, "Assigned", y2024_apr.AddHours(8));
        SetAuditLogDate(o5, "Started", y2024_apr.AddDays(1));
        SetAuditLogDate(o5, "Completed", y2024_apr.AddDays(1).AddMinutes(240));
        SetAssignmentDates(o5, y2024_apr.AddDays(1),
                               y2024_apr.AddDays(1).AddMinutes(240));

        var o6 = new Request(
            "IT — network switch procurement",
            "Purchase managed network switch for server room upgrade.",
            michael.Id, lac, PriorityLevel.High, RequestCategory.ITEquipment,
            "Ahmed Mohamed", "+216 77 777 777", null,
            y2024_apr.AddDays(3), 620m);
        o6.Assign(courier1.Id);
        o6.Start();
        o6.Complete(600m, "Switch delivered to IT team and installed.");
        o6.SubmitSurvey(5, "Handled expensive equipment with care.");
        SetCreatedAt(o6, y2024_apr.AddDays(1));
        SetAuditLogDate(o6, "Created", y2024_apr.AddDays(1));
        SetAuditLogDate(o6, "Assigned", y2024_apr.AddDays(1).AddHours(4));
        SetAuditLogDate(o6, "Started", y2024_apr.AddDays(2));
        SetAuditLogDate(o6, "Completed", y2024_apr.AddDays(2).AddMinutes(180));
        SetAssignmentDates(o6, y2024_apr.AddDays(2),
                               y2024_apr.AddDays(2).AddMinutes(180));

        // ── May 2024 ──────────────────────────────────────────────────────────
        var o7 = new Request(
            "Travel — conference registration documents",
            "Deliver conference registration packets to attendees.",
            sarah.Id, marsa, PriorityLevel.Normal, RequestCategory.Travel,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            y2024_may.AddDays(2), 45m);
        o7.Assign(courier2.Id);
        o7.Start();
        o7.Complete(40m, "All registration packets delivered.");
        o7.SubmitSurvey(3, "Delivery was on time but courier seemed lost initially.");
        SetCreatedAt(o7, y2024_may);
        SetAuditLogDate(o7, "Created", y2024_may);
        SetAuditLogDate(o7, "Assigned", y2024_may.AddHours(6));
        SetAuditLogDate(o7, "Started", y2024_may.AddDays(1));
        SetAuditLogDate(o7, "Completed", y2024_may.AddDays(1).AddMinutes(40));
        SetAssignmentDates(o7, y2024_may.AddDays(1),
                               y2024_may.AddDays(1).AddMinutes(40));

        var o8 = new Request(
            "Office supplies — quarterly restock",
            "Purchase Q2 stationery and consumables for all departments.",
            michael.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Sonia Mejri", "+216 71 890 123", null,
            y2024_may.AddDays(5), 220m);
        o8.Assign(courier1.Id);
        o8.Start();
        o8.Complete(210m, "All departments restocked.");
        // No survey
        SetCreatedAt(o8, y2024_may.AddDays(1));
        SetAuditLogDate(o8, "Created", y2024_may.AddDays(1));
        SetAuditLogDate(o8, "Assigned", y2024_may.AddDays(1).AddHours(5));
        SetAuditLogDate(o8, "Started", y2024_may.AddDays(2));
        SetAuditLogDate(o8, "Completed", y2024_may.AddDays(2).AddMinutes(160));
        SetAssignmentDates(o8, y2024_may.AddDays(2),
                               y2024_may.AddDays(2).AddMinutes(160));

        // ── Jun 2024 ──────────────────────────────────────────────────────────
        var o9 = new Request(
            "Facilities — AC maintenance coordination",
            "Deliver maintenance request forms to building management company.",
            sarah.Id, tunis, PriorityLevel.Normal, RequestCategory.Facilities,
            "Ahmed Mohamed", "+216 77 777 777", null,
            y2024_jun.AddDays(3), 0m);
        o9.Assign(courier2.Id);
        o9.Start();
        o9.Complete(null, "Forms delivered and acknowledged.");
        o9.SubmitSurvey(4, "Quick and hassle-free.");
        SetCreatedAt(o9, y2024_jun);
        SetAuditLogDate(o9, "Created", y2024_jun);
        SetAuditLogDate(o9, "Assigned", y2024_jun.AddHours(4));
        SetAuditLogDate(o9, "Started", y2024_jun.AddDays(1));
        SetAuditLogDate(o9, "Completed", y2024_jun.AddDays(1).AddMinutes(60));
        SetAssignmentDates(o9, y2024_jun.AddDays(1),
                               y2024_jun.AddDays(1).AddMinutes(60));

        var o10 = new Request(
            "IT — printer fleet maintenance",
            "Deliver printer maintenance kits to all three office floors.",
            michael.Id, lac, PriorityLevel.Normal, RequestCategory.ITEquipment,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            y2024_jun.AddDays(4), 175m);
        o10.Assign(courier1.Id);
        o10.Start();
        o10.Complete(165m, "Maintenance kits delivered to all floors.");
        o10.SubmitSurvey(5, "Thorough and efficient.");
        SetCreatedAt(o10, y2024_jun.AddDays(1));
        SetAuditLogDate(o10, "Created", y2024_jun.AddDays(1));
        SetAuditLogDate(o10, "Assigned", y2024_jun.AddDays(1).AddHours(3));
        SetAuditLogDate(o10, "Started", y2024_jun.AddDays(2));
        SetAuditLogDate(o10, "Completed", y2024_jun.AddDays(2).AddMinutes(165));
        SetAssignmentDates(o10, y2024_jun.AddDays(2),
                                y2024_jun.AddDays(2).AddMinutes(165));

        // ── Jul 2024 ──────────────────────────────────────────────────────────
        var o11 = new Request(
            "Travel — summer offsite logistics",
            "Deliver team offsite event materials to La Marsa venue.",
            sarah.Id, marsa, PriorityLevel.High, RequestCategory.Travel,
            "Sonia Mejri", "+216 71 890 123", null,
            y2024_jul.AddDays(2), 130m);
        o11.Assign(courier2.Id);
        o11.Start();
        o11.Complete(125m, "All event materials delivered on time.");
        o11.SubmitSurvey(5, "Handled multiple boxes with care — great job.");
        SetCreatedAt(o11, y2024_jul);
        SetAuditLogDate(o11, "Created", y2024_jul);
        SetAuditLogDate(o11, "Assigned", y2024_jul.AddHours(2));
        SetAuditLogDate(o11, "Started", y2024_jul.AddHours(4));
        SetAuditLogDate(o11, "Completed", y2024_jul.AddHours(4).AddMinutes(125));
        SetAssignmentDates(o11, y2024_jul.AddHours(4),
                                y2024_jul.AddHours(4).AddMinutes(125));

        var o12 = new Request(
            "Cancelled — office supplies duplicate order",
            "Purchase additional toner cartridges — duplicate of existing order.",
            michael.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Ahmed Mohamed", "+216 77 777 777", null,
            y2024_jul.AddDays(3), 95m);
        o12.Cancel("Duplicate request — original order already fulfilled.");
        SetCreatedAt(o12, y2024_jul.AddDays(1));
        SetAuditLogDate(o12, "Created", y2024_jul.AddDays(1));
        SetAuditLogDate(o12, "Cancelled", y2024_jul.AddDays(1).AddHours(1));

        // ── Aug 2024 ──────────────────────────────────────────────────────────
        var o13 = new Request(
            "Facilities — emergency generator fuel",
            "Coordinate fuel delivery for backup generator with supplier.",
            sarah.Id, tunis, PriorityLevel.Urgent, RequestCategory.Facilities,
            "Ahmed Ben Ali", "+216 71 234 567",
            "Generator must not fall below 20% capacity.",
            y2024_aug.AddDays(1), 380m);
        o13.Assign(courier1.Id);
        o13.Start();
        o13.Complete(370m, "Fuel delivery coordinated and confirmed.");
        o13.SubmitSurvey(2, "Urgent request took too long — generator nearly ran dry.");
        SetCreatedAt(o13, y2024_aug);
        SetAuditLogDate(o13, "Created", y2024_aug);
        SetAuditLogDate(o13, "Assigned", y2024_aug.AddHours(3));
        SetAuditLogDate(o13, "Started", y2024_aug.AddDays(1));
        SetAuditLogDate(o13, "Completed", y2024_aug.AddDays(1).AddMinutes(300));
        SetAssignmentDates(o13, y2024_aug.AddDays(1),
                                y2024_aug.AddDays(1).AddMinutes(300));

        var o14 = new Request(
            "IT — tablet procurement for field team",
            "Purchase 3 tablets with cases for the field operations team.",
            michael.Id, lac, PriorityLevel.High, RequestCategory.ITEquipment,
            "Sonia Mejri", "+216 71 890 123", null,
            y2024_aug.AddDays(4), 890m);
        o14.Assign(courier2.Id);
        o14.Start();
        o14.Complete(850m, "Tablets and cases delivered to field team lead.");
        o14.SubmitSurvey(4, "Good handling of high-value items.");
        SetCreatedAt(o14, y2024_aug.AddDays(1));
        SetAuditLogDate(o14, "Created", y2024_aug.AddDays(1));
        SetAuditLogDate(o14, "Assigned", y2024_aug.AddDays(1).AddHours(6));
        SetAuditLogDate(o14, "Started", y2024_aug.AddDays(2));
        SetAuditLogDate(o14, "Completed", y2024_aug.AddDays(2).AddMinutes(210));
        SetAssignmentDates(o14, y2024_aug.AddDays(2),
                                y2024_aug.AddDays(2).AddMinutes(210));

        // ── Sep 2024 ──────────────────────────────────────────────────────────
        var o15 = new Request(
            "Travel — Q3 business trip documentation",
            "Deliver visa applications and hotel confirmations for Q3 business trips.",
            sarah.Id, marsa, PriorityLevel.High, RequestCategory.Travel,
            "Ahmed Mohamed", "+216 77 777 777", null,
            y2024_sep.AddDays(3), 65m);
        o15.Assign(courier1.Id);
        o15.Start();
        o15.Complete(60m, "All travel documentation delivered.");
        o15.SubmitSurvey(4, "Reliable and on time.");
        SetCreatedAt(o15, y2024_sep);
        SetAuditLogDate(o15, "Created", y2024_sep);
        SetAuditLogDate(o15, "Assigned", y2024_sep.AddHours(4));
        SetAuditLogDate(o15, "Started", y2024_sep.AddDays(1));
        SetAuditLogDate(o15, "Completed", y2024_sep.AddDays(1).AddMinutes(60));
        SetAssignmentDates(o15, y2024_sep.AddDays(1),
                                y2024_sep.AddDays(1).AddMinutes(60));

        var o16 = new Request(
            "Office supplies — Q3 restock",
            "Purchase Q3 office consumables for all departments.",
            michael.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            y2024_sep.AddDays(5), 195m);
        o16.Assign(courier2.Id);
        o16.Start();
        o16.Complete(185m, "All consumables distributed to departments.");
        o16.SubmitSurvey(5, "Always consistent and reliable.");
        SetCreatedAt(o16, y2024_sep.AddDays(1));
        SetAuditLogDate(o16, "Created", y2024_sep.AddDays(1));
        SetAuditLogDate(o16, "Assigned", y2024_sep.AddDays(1).AddHours(5));
        SetAuditLogDate(o16, "Started", y2024_sep.AddDays(2));
        SetAuditLogDate(o16, "Completed", y2024_sep.AddDays(2).AddMinutes(130));
        SetAssignmentDates(o16, y2024_sep.AddDays(2),
                                y2024_sep.AddDays(2).AddMinutes(130));

        // ── Oct 2024 ──────────────────────────────────────────────────────────
        var o17 = new Request(
            "Facilities — office deep clean coordination",
            "Coordinate quarterly deep clean with external cleaning company.",
            sarah.Id, lac, PriorityLevel.Normal, RequestCategory.Facilities,
            "Sonia Mejri", "+216 71 890 123", null,
            y2024_oct.AddDays(3), 0m);
        o17.Assign(courier1.Id);
        o17.Start();
        o17.Complete(null, "Deep clean coordination confirmed with vendor.");
        o17.SubmitSurvey(4, "Smooth coordination process.");
        SetCreatedAt(o17, y2024_oct);
        SetAuditLogDate(o17, "Created", y2024_oct);
        SetAuditLogDate(o17, "Assigned", y2024_oct.AddHours(3));
        SetAuditLogDate(o17, "Started", y2024_oct.AddDays(1));
        SetAuditLogDate(o17, "Completed", y2024_oct.AddDays(1).AddMinutes(90));
        SetAssignmentDates(o17, y2024_oct.AddDays(1),
                                y2024_oct.AddDays(1).AddMinutes(90));

        var o18 = new Request(
            "IT — UPS battery replacements",
            "Purchase replacement UPS batteries for server room.",
            michael.Id, lac, PriorityLevel.High, RequestCategory.ITEquipment,
            "Ahmed Mohamed", "+216 77 777 777", null,
            y2024_oct.AddDays(4), 420m);
        o18.Assign(courier2.Id);
        o18.Start();
        o18.Complete(400m, "UPS batteries replaced by IT team.");
        o18.SubmitSurvey(3, "Delivery was fine but invoice was incorrect.");
        SetCreatedAt(o18, y2024_oct.AddDays(1));
        SetAuditLogDate(o18, "Created", y2024_oct.AddDays(1));
        SetAuditLogDate(o18, "Assigned", y2024_oct.AddDays(1).AddHours(7));
        SetAuditLogDate(o18, "Started", y2024_oct.AddDays(2));
        SetAuditLogDate(o18, "Completed", y2024_oct.AddDays(2).AddMinutes(200));
        SetAssignmentDates(o18, y2024_oct.AddDays(2),
                                y2024_oct.AddDays(2).AddMinutes(200));

        // ── Nov 2024 ──────────────────────────────────────────────────────────
        var o19 = new Request(
            "Travel — year-end conference materials",
            "Deliver printed conference materials to venue before arrival of attendees.",
            sarah.Id, marsa, PriorityLevel.Urgent, RequestCategory.Travel,
            "Ahmed Ben Ali", "+216 71 234 567",
            "Must arrive before 8 AM.",
            y2024_nov.AddDays(1), 110m);
        o19.Assign(courier1.Id);
        o19.Start();
        o19.Complete(105m, "Materials delivered at 7:45 AM — before deadline.");
        o19.SubmitSurvey(5, "Arrived early on an urgent early-morning delivery.");
        SetCreatedAt(o19, y2024_nov);
        SetAuditLogDate(o19, "Created", y2024_nov);
        SetAuditLogDate(o19, "Assigned", y2024_nov.AddHours(2));
        SetAuditLogDate(o19, "Started", y2024_nov.AddHours(4));
        SetAuditLogDate(o19, "Completed", y2024_nov.AddHours(4).AddMinutes(105));
        SetAssignmentDates(o19, y2024_nov.AddHours(4),
                                y2024_nov.AddHours(4).AddMinutes(105));

        var o20 = new Request(
            "Office supplies — year-end stationery pack",
            "Purchase year-end stationery packs for all staff.",
            michael.Id, tunis, PriorityLevel.Normal, RequestCategory.OfficeSupplies,
            "Sonia Mejri", "+216 71 890 123", null,
            y2024_nov.AddDays(4), 310m);
        o20.Assign(courier2.Id);
        o20.Start();
        o20.Complete(295m, "Stationery packs distributed to all staff.");
        o20.SubmitSurvey(4, "Large order handled efficiently.");
        SetCreatedAt(o20, y2024_nov.AddDays(1));
        SetAuditLogDate(o20, "Created", y2024_nov.AddDays(1));
        SetAuditLogDate(o20, "Assigned", y2024_nov.AddDays(1).AddHours(4));
        SetAuditLogDate(o20, "Started", y2024_nov.AddDays(2));
        SetAuditLogDate(o20, "Completed", y2024_nov.AddDays(2).AddMinutes(180));
        SetAssignmentDates(o20, y2024_nov.AddDays(2),
                                y2024_nov.AddDays(2).AddMinutes(180));

        // ── Dec 2024 ──────────────────────────────────────────────────────────
        var o21 = new Request(
            "Facilities — year-end building inspection",
            "Submit year-end building inspection checklist to property management.",
            sarah.Id, tunis, PriorityLevel.High, RequestCategory.Facilities,
            "Ahmed Mohamed", "+216 77 777 777", null,
            y2024_dec.AddDays(2), 0m);
        o21.Assign(courier1.Id);
        o21.Start();
        o21.Complete(null, "Inspection checklist submitted and acknowledged.");
        o21.SubmitSurvey(5, "Handled important year-end documentation perfectly.");
        SetCreatedAt(o21, y2024_dec);
        SetAuditLogDate(o21, "Created", y2024_dec);
        SetAuditLogDate(o21, "Assigned", y2024_dec.AddHours(3));
        SetAuditLogDate(o21, "Started", y2024_dec.AddDays(1));
        SetAuditLogDate(o21, "Completed", y2024_dec.AddDays(1).AddMinutes(75));
        SetAssignmentDates(o21, y2024_dec.AddDays(1),
                                y2024_dec.AddDays(1).AddMinutes(75));

        var o22 = new Request(
            "IT — year-end equipment audit",
            "Collect asset tags and serial numbers from all workstations for audit.",
            michael.Id, lac, PriorityLevel.Normal, RequestCategory.ITEquipment,
            "Ahmed Ben Ali", "+216 71 234 567", null,
            y2024_dec.AddDays(4), 0m);
        o22.Assign(courier2.Id);
        o22.Start();
        o22.Complete(null, "Asset audit data collected from all floors.");
        o22.SubmitSurvey(4, "Methodical and thorough.");
        SetCreatedAt(o22, y2024_dec.AddDays(1));
        SetAuditLogDate(o22, "Created", y2024_dec.AddDays(1));
        SetAuditLogDate(o22, "Assigned", y2024_dec.AddDays(1).AddHours(5));
        SetAuditLogDate(o22, "Started", y2024_dec.AddDays(2));
        SetAuditLogDate(o22, "Completed", y2024_dec.AddDays(2).AddMinutes(120));
        SetAssignmentDates(o22, y2024_dec.AddDays(2),
                                y2024_dec.AddDays(2).AddMinutes(120));

        var o23 = new Request(
            "Cancelled — holiday party supplies",
            "Purchase decorations and supplies for office holiday party.",
            sarah.Id, tunis, PriorityLevel.Normal, RequestCategory.Other,
            "Sonia Mejri", "+216 71 890 123", null,
            y2024_dec.AddDays(3), 200m);
        o23.Cancel("Party venue changed — catering company handling supplies.");
        SetCreatedAt(o23, y2024_dec.AddDays(2));
        SetAuditLogDate(o23, "Created", y2024_dec.AddDays(2));
        SetAuditLogDate(o23, "Cancelled", y2024_dec.AddDays(2).AddHours(4));


        // ── DEADLINE RISK ALERT TEST ──────────────────────────────────────────
        // TotalDuration = 36min → Threshold = MAX(432s, 7200s) = 7200s (2h floor)
        // RemainingTime at startup ≈ 7min = 420s → 420 <= 7200 → AT RISK ✓

        var riskTest = new Request(
            "[TEST] Deadline risk alert",
            "Seeded request to verify the DeadlineMonitoringService fires correctly.",
            sarah.Id, tunis, PriorityLevel.Urgent, RequestCategory.Other,
            "Test Contact", "+216 00 000 000", null,
            deadline: now.AddMinutes(7),
            estimatedCost: 0m);

        riskTest.Assign(courier1.Id);

        SetCreatedAt(riskTest, now.AddMinutes(-29));
        SetAuditLogDate(riskTest, "Created", now.AddMinutes(-29));
        SetAuditLogDate(riskTest, "Assigned", now.AddMinutes(-5));
        // ── Persist ────────────────────────────────────────────────────────────
        var all = new[]
        {
            h1,  h2,  h3,  h4,  h5,  h6,  h7,  h8,  h9,  h10,
            h11, h12, h13, h14, h15, h16, h17, h18, h19, h20,
            h21, h22, h23, h24, h25, h26, h27, h28, h29, h30,
            h31, h32, h33, h34, h35, h36, h37, h38, h39, h40,
            o1,  o2,  o3,  o4,  o5,  o6,  o7,  o8,  o9,  o10,
            o11, o12, o13, o14, o15, o16, o17, o18, o19, o20,
            o21, o22, o23, riskTest
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
        string role,
        double? latitude = null,
        double? longitude = null,
        string? city = null)
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
            Latitude = latitude,
            Longitude = longitude,
            City = city
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