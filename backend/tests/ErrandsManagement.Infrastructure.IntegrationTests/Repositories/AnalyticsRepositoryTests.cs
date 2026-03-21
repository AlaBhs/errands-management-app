using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.DTOs;
using ErrandsManagement.Application.Users.Queries.GetAllUsers;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Infrastructure.IntegrationTests.Data;
using ErrandsManagement.Infrastructure.Repositories;
using FluentAssertions;

namespace ErrandsManagement.Infrastructure.IntegrationTests.Analytics;

public class AnalyticsRepositoryTests : IAsyncLifetime
{
    private AppDbContext _db = null!;
    private AnalyticsRepository _repo = null!;

    // Fixed courier IDs — deterministic across all tests
    private static readonly Guid Courier1Id = Guid.NewGuid();
    private static readonly Guid Courier2Id = Guid.NewGuid();

    private static readonly Address DefaultAddress =
        new("Rue de la Liberté", "Tunis", "1001", "Tunisia");

    public async ValueTask InitializeAsync()
    {
        _db = TestDbContextFactory.Create();
        // IUserRepository not needed for infrastructure tests —
        // name resolution is tested at API level
        _repo = new AnalyticsRepository(_db, new StubUserRepository());
        await _db.Database.EnsureCreatedAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
    }

    private CancellationToken CT => TestContext.Current.CancellationToken;

    // ── GetSummaryAsync ────────────────────────────────────────────────────────

    [Fact]
    public async Task GetSummaryAsync_Should_Return_Zero_Totals_When_No_Requests()
    {
        var result = await _repo.GetSummaryAsync(null, null, CT);

        result.TotalRequests.Should().Be(0);
        result.ByStatus.Should().BeEmpty();
        result.ByCategory.Should().BeEmpty();
        result.AvgLifecycleMinutes.Should().BeNull();
        result.AvgExecutionMinutes.Should().BeNull();
        result.AvgSurveyRating.Should().BeNull();
        result.DeadlineComplianceRate.Should().BeNull();
        result.TotalEstimatedCost.Should().Be(0m);
        result.TotalActualCost.Should().Be(0m);
    }

    [Fact]
    public async Task GetSummaryAsync_Should_Count_Requests_By_Status()
    {
        var r1 = MakeRequest(RequestStatus.Pending);
        var r2 = MakeRequest(RequestStatus.Pending);
        var r3 = MakeRequest(RequestStatus.Completed);
        await SeedAsync(r1, r2, r3);

        var result = await _repo.GetSummaryAsync(null, null, CT);

        result.TotalRequests.Should().Be(3);
        result.ByStatus["Pending"].Should().Be(2);
        result.ByStatus["Completed"].Should().Be(1);
    }

    [Fact]
    public async Task GetSummaryAsync_Should_Count_Requests_By_Category()
    {
        var r1 = MakeRequest(category: RequestCategory.Travel);
        var r2 = MakeRequest(category: RequestCategory.Travel);
        var r3 = MakeRequest(category: RequestCategory.ITEquipment);
        await SeedAsync(r1, r2, r3);

        var result = await _repo.GetSummaryAsync(null, null, CT);

        result.ByCategory["Travel"].Should().Be(2);
        result.ByCategory["ITEquipment"].Should().Be(1);
    }

    [Fact]
    public async Task GetSummaryAsync_Should_Sum_EstimatedCost()
    {
        var r1 = MakeRequest(estimatedCost: 100m);
        var r2 = MakeRequest(estimatedCost: 200m);
        var r3 = MakeRequest(estimatedCost: null);
        await SeedAsync(r1, r2, r3);

        var result = await _repo.GetSummaryAsync(null, null, CT);

        result.TotalEstimatedCost.Should().Be(300m);
    }

    [Fact]
    public async Task GetSummaryAsync_Should_Sum_ActualCost_Across_Assignments()
    {
        var r1 = MakeCompletedRequest(Courier1Id, actualCost: 80m);
        var r2 = MakeCompletedRequest(Courier2Id, actualCost: 120m);
        await SeedAsync(r1, r2);

        var result = await _repo.GetSummaryAsync(null, null, CT);

        result.TotalActualCost.Should().Be(200m);
    }

    [Fact]
    public async Task GetSummaryAsync_Should_Calculate_AvgSurveyRating()
    {
        var r1 = MakeCompletedRequestWithSurvey(Courier1Id, rating: 4);
        var r2 = MakeCompletedRequestWithSurvey(Courier2Id, rating: 2);
        await SeedAsync(r1, r2);

        var result = await _repo.GetSummaryAsync(null, null, CT);

        result.AvgSurveyRating.Should().BeApproximately(3.0, 0.01);
    }

    [Fact]
    public async Task GetSummaryAsync_Should_Return_Null_AvgRating_When_No_Surveys()
    {
        var r1 = MakeRequest();
        await SeedAsync(r1);

        var result = await _repo.GetSummaryAsync(null, null, CT);

        result.AvgSurveyRating.Should().BeNull();
    }

    [Fact]
    public async Task GetSummaryAsync_Should_Filter_By_From_Date()
    {
        var old = MakeRequest(createdAt: DateTime.UtcNow.AddMonths(-3));
        var recent = MakeRequest(createdAt: DateTime.UtcNow.AddDays(-5));
        await SeedAsync(old, recent);

        var from = DateTime.UtcNow.AddDays(-10);
        var result = await _repo.GetSummaryAsync(from, null, CT);

        result.TotalRequests.Should().Be(1);
    }

    [Fact]
    public async Task GetSummaryAsync_Should_Filter_By_To_Date()
    {
        var old = MakeRequest(createdAt: DateTime.UtcNow.AddMonths(-3));
        var recent = MakeRequest(createdAt: DateTime.UtcNow.AddDays(-5));
        await SeedAsync(old, recent);

        var to = DateTime.UtcNow.AddMonths(-2);
        var result = await _repo.GetSummaryAsync(null, to, CT);

        result.TotalRequests.Should().Be(1);
    }

    [Fact]
    public async Task GetSummaryAsync_Should_Return_Null_DeadlineCompliance_When_No_Deadlines()
    {
        // Completed request with no deadline
        var r = MakeCompletedRequest(Courier1Id, actualCost: 50m, deadline: null);
        await SeedAsync(r);

        var result = await _repo.GetSummaryAsync(null, null, CT);

        result.DeadlineComplianceRate.Should().BeNull();
    }

    [Fact]
    public async Task GetSummaryAsync_Should_Calculate_DeadlineCompliance_Correctly()
    {
        // r1: completed before deadline — on time
        var r1 = MakeCompletedRequest(
            Courier1Id,
            actualCost: 50m,
            deadline: DateTime.UtcNow.AddDays(2),
            completedAt: DateTime.UtcNow.AddDays(-1));

        // r2: completed after deadline — late
        var r2 = MakeCompletedRequest(
            Courier2Id,
            actualCost: 50m,
            deadline: DateTime.UtcNow.AddDays(-3),
            completedAt: DateTime.UtcNow.AddDays(-1));

        await SeedAsync(r1, r2);

        var result = await _repo.GetSummaryAsync(null, null, CT);

        // 1 out of 2 on time = 50%
        result.DeadlineComplianceRate.Should().BeApproximately(50.0, 0.1);
    }

    // ── GetTrendAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetTrendAsync_Should_Return_Six_Points_By_Default()
    {
        var result = await _repo.GetTrendAsync(null, null, CT);

        result.Should().HaveCount(6);
    }

    [Fact]
    public async Task GetTrendAsync_Should_Fill_Months_With_Zero_When_No_Requests()
    {
        var result = await _repo.GetTrendAsync(null, null, CT);

        result.Should().AllSatisfy(p => p.Count.Should().Be(0));
    }

    [Fact]
    public async Task GetTrendAsync_Should_Count_Requests_In_Correct_Month()
    {
        var thisMonth1 = MakeRequest(createdAt: DateTime.UtcNow);
        var thisMonth2 = MakeRequest(createdAt: DateTime.UtcNow);
        var lastMonth = MakeRequest(createdAt: DateTime.UtcNow.AddMonths(-1));
        await SeedAsync(thisMonth1, thisMonth2, lastMonth);

        var result = await _repo.GetTrendAsync(null, null, CT);

        var current = result.Single(p =>
            p.Year == DateTime.UtcNow.Year &&
            p.Month == DateTime.UtcNow.Month);
        var previous = result.Single(p =>
            p.Year == DateTime.UtcNow.AddMonths(-1).Year &&
            p.Month == DateTime.UtcNow.AddMonths(-1).Month);

        current.Count.Should().Be(2);
        previous.Count.Should().Be(1);
    }
    [Fact]
    public async Task GetTrendAsync_Should_Respect_Custom_Date_Range()
    {
        var from = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = new DateTime(2024, 3, 31, 0, 0, 0, DateTimeKind.Utc);

        var jan = MakeRequest(createdAt: new DateTime(2024, 1, 15, 0, 0, 0, DateTimeKind.Utc));
        var feb = MakeRequest(createdAt: new DateTime(2024, 2, 10, 0, 0, 0, DateTimeKind.Utc));
        var dec = MakeRequest(createdAt: new DateTime(2024, 12, 1, 0, 0, 0, DateTimeKind.Utc));
        await SeedAsync(jan, feb, dec);

        var result = await _repo.GetTrendAsync(from, to, CT);

        result.Should().HaveCount(3); // Jan, Feb, Mar
        result.Sum(p => p.Count).Should().Be(2); // jan + feb only
    }

    [Fact]
    public async Task GetTrendAsync_Should_Order_Points_Chronologically()
    {
        var result = await _repo.GetTrendAsync(null, null, CT);

        var dates = result.Select(p => new DateTime(p.Year, p.Month, 1)).ToList();
        dates.Should().BeInAscendingOrder();
    }

    // ── GetCostBreakdownAsync ──────────────────────────────────────────────────

    [Fact]
    public async Task GetCostBreakdownAsync_Should_Return_Empty_When_No_Requests()
    {
        var result = await _repo.GetCostBreakdownAsync(null, null, CT);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetCostBreakdownAsync_Should_Group_EstimatedCost_By_Category()
    {
        var r1 = MakeRequest(category: RequestCategory.Travel, estimatedCost: 100m);
        var r2 = MakeRequest(category: RequestCategory.Travel, estimatedCost: 50m);
        var r3 = MakeRequest(category: RequestCategory.Facilities, estimatedCost: 200m);
        await SeedAsync(r1, r2, r3);

        var result = await _repo.GetCostBreakdownAsync(null, null, CT);

        var travel = result.Single(r => r.Category == "Travel");
        var facilities = result.Single(r => r.Category == "Facilities");

        travel.EstimatedCost.Should().Be(150m);
        facilities.EstimatedCost.Should().Be(200m);
    }

    [Fact]
    public async Task GetCostBreakdownAsync_Should_Sum_ActualCost_By_Category()
    {
        var r1 = MakeCompletedRequest(Courier1Id, actualCost: 90m,
            category: RequestCategory.Travel);
        var r2 = MakeCompletedRequest(Courier2Id, actualCost: 60m,
            category: RequestCategory.Travel);
        await SeedAsync(r1, r2);

        var result = await _repo.GetCostBreakdownAsync(null, null, CT);

        var travel = result.Single(r => r.Category == "Travel");
        travel.ActualCost.Should().Be(150m);
    }

    [Fact]
    public async Task GetCostBreakdownAsync_Should_Default_ActualCost_To_Zero_When_No_Assignments()
    {
        var r = MakeRequest(category: RequestCategory.Other, estimatedCost: 100m);
        await SeedAsync(r);

        var result = await _repo.GetCostBreakdownAsync(null, null, CT);

        var other = result.Single(r => r.Category == "Other");
        other.ActualCost.Should().Be(0m);
    }

    [Fact]
    public async Task GetCostBreakdownAsync_Should_Filter_By_Date_Range()
    {
        var old = MakeRequest(category: RequestCategory.Travel,
            estimatedCost: 500m, createdAt: DateTime.UtcNow.AddYears(-1));
        var recent = MakeRequest(category: RequestCategory.Travel,
            estimatedCost: 100m, createdAt: DateTime.UtcNow.AddDays(-5));
        await SeedAsync(old, recent);

        var from = DateTime.UtcNow.AddDays(-10);
        var result = await _repo.GetCostBreakdownAsync(from, null, CT);

        var travel = result.Single(r => r.Category == "Travel");
        travel.EstimatedCost.Should().Be(100m);
    }

    // ── GetCourierPerformanceAsync ─────────────────────────────────────────────

    [Fact]
    public async Task GetCourierPerformanceAsync_Should_Return_Empty_When_No_Assignments()
    {
        var result = await _repo.GetCourierPerformanceAsync(null, null, CT);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetCourierPerformanceAsync_Should_Return_One_Row_Per_Courier()
    {
        var r1 = MakeCompletedRequest(Courier1Id, actualCost: 50m);
        var r2 = MakeCompletedRequest(Courier2Id, actualCost: 60m);
        await SeedAsync(r1, r2);

        var result = await _repo.GetCourierPerformanceAsync(null, null, CT);

        result.Should().HaveCount(2);
        result.Select(r => r.CourierId)
              .Should().Contain([Courier1Id, Courier2Id]);
    }

    [Fact]
    public async Task GetCourierPerformanceAsync_Should_Count_Completed_Correctly()
    {
        var c1 = MakeCompletedRequest(Courier1Id, actualCost: 50m);
        var c2 = MakeCompletedRequest(Courier1Id, actualCost: 60m);
        var a = MakeAssignedRequest(Courier1Id);
        await SeedAsync(c1, c2, a);

        var result = await _repo.GetCourierPerformanceAsync(null, null, CT);

        var courier = result.Single(r => r.CourierId == Courier1Id);
        courier.TotalAssignments.Should().Be(3);
        courier.Completed.Should().Be(2);
    }

    [Fact]
    public async Task GetCourierPerformanceAsync_Should_Return_Null_OnTimeRate_When_No_Deadlines()
    {
        // Completed request with no deadline
        var r = MakeCompletedRequest(Courier1Id, actualCost: 50m, deadline: null);
        await SeedAsync(r);

        var result = await _repo.GetCourierPerformanceAsync(null, null, CT);

        result.Single().OnTimeRate.Should().BeNull();
    }

    [Fact]
    public async Task GetCourierPerformanceAsync_Should_Calculate_OnTimeRate()
    {
        // On time
        var r1 = MakeCompletedRequest(
            Courier1Id, actualCost: 50m,
            deadline: DateTime.UtcNow.AddDays(2),
            completedAt: DateTime.UtcNow.AddDays(-1));
        // Late
        var r2 = MakeCompletedRequest(
            Courier1Id, actualCost: 50m,
            deadline: DateTime.UtcNow.AddDays(-3),
            completedAt: DateTime.UtcNow.AddDays(-1));
        await SeedAsync(r1, r2);

        var result = await _repo.GetCourierPerformanceAsync(null, null, CT);

        result.Single().OnTimeRate.Should().BeApproximately(50.0, 0.1);
    }

    [Fact]
    public async Task GetCourierPerformanceAsync_Should_Filter_By_Date_Range()
    {
        var old = MakeCompletedRequest(Courier1Id, actualCost: 50m,
            createdAt: DateTime.UtcNow.AddYears(-1));
        var recent = MakeCompletedRequest(Courier2Id, actualCost: 60m,
            createdAt: DateTime.UtcNow.AddDays(-5));
        await SeedAsync(old, recent);

        var from = DateTime.UtcNow.AddDays(-10);
        var result = await _repo.GetCourierPerformanceAsync(from, null, CT);

        result.Should().HaveCount(1);
        result.Single().CourierId.Should().Be(Courier2Id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Request MakeRequest(
        RequestStatus status = RequestStatus.Pending,
        RequestCategory category = RequestCategory.Other,
        decimal? estimatedCost = null,
        DateTime? createdAt = null)
    {
        var r = new Request(
            "Test request", "Description",
            Guid.NewGuid(), DefaultAddress,
            PriorityLevel.Normal, category,
            null, null, null, null, estimatedCost);

        if (createdAt.HasValue)
            SetBackingField(r, "<CreatedAt>k__BackingField", createdAt.Value);

        // Force status if needed — only for non-default statuses
        if (status != RequestStatus.Pending)
            SetBackingField(r, "<Status>k__BackingField", status);

        return r;
    }

    private static Request MakeCompletedRequest(
        Guid courierId,
        decimal? actualCost = null,
        decimal? estimatedCost = null,
        RequestCategory category = RequestCategory.Other,
        DateTime? deadline = null,
        DateTime? completedAt = null,
        DateTime? createdAt = null)
    {
        var r = new Request(
            "Test request", "Description",
            Guid.NewGuid(), DefaultAddress,
            PriorityLevel.Normal, category,
            null, null, null, deadline, estimatedCost);

        r.Assign(courierId);
        r.Start();
        r.Complete(actualCost, null);

        var startedAt = completedAt?.AddMinutes(-60) ?? DateTime.UtcNow.AddMinutes(-60);
        var finishedAt = completedAt ?? DateTime.UtcNow;

        SetAssignmentDates(r, startedAt, finishedAt);

        if (createdAt.HasValue)
            SetBackingField(r, "<CreatedAt>k__BackingField", createdAt.Value);

        return r;
    }

    private static Request MakeCompletedRequestWithSurvey(
        Guid courierId,
        int rating,
        decimal? actualCost = null)
    {
        var r = MakeCompletedRequest(courierId, actualCost);
        r.SubmitSurvey(rating, null);
        return r;
    }

    private static Request MakeAssignedRequest(Guid courierId)
    {
        var r = new Request(
            "Assigned request", "Description",
            Guid.NewGuid(), DefaultAddress,
            PriorityLevel.Normal, RequestCategory.Other,
            null, null, null, null, null);
        r.Assign(courierId);
        return r;
    }

    private async Task SeedAsync(params Request[] requests)
    {
        foreach (var r in requests)
        {
            _db.ChangeTracker.Clear();
            await _db.Requests.AddAsync(r);
            await _db.SaveChangesAsync();
        }
    }

    private static void SetAssignmentDates(
        Request request,
        DateTime startedAt,
        DateTime completedAt)
    {
        var field = typeof(Request).GetField(
            "_assignments",
            System.Reflection.BindingFlags.NonPublic |
            System.Reflection.BindingFlags.Instance);
        var assignments = (List<Assignment>)field!.GetValue(request)!;
        var assignment = assignments.Last();

        SetBackingField(assignment, "<StartedAt>k__BackingField", (DateTime?)startedAt);
        SetBackingField(assignment, "<CompletedAt>k__BackingField", (DateTime?)completedAt);
    }

    private static void SetBackingField(object target, string fieldName, object? value)
    {
        var type = target.GetType();
        System.Reflection.FieldInfo? field = null;
        while (type != null && field == null)
        {
            field = type.GetField(fieldName,
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Instance);
            type = type.BaseType;
        }
        field?.SetValue(target, value);
    }
}

/// <summary>
/// Stub IUserRepository for infrastructure tests — name resolution
/// is not under test here, only EF query logic.
/// </summary>
internal sealed class StubUserRepository : IUserRepository
{
    public Task<UserDto?> FindByIdAsync(
        Guid userId,
        CancellationToken ct = default)
        => Task.FromResult<UserDto?>(new UserDto(
               userId, "test@test.com", "Test Courier", ["Courier"], true));

    public Task<IReadOnlyList<UserDto>> GetAllAsync(
        CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<UserDto>>(Array.Empty<UserDto>());

    public Task<UserDto?> FindByEmailAsync(
        string email,
        CancellationToken ct = default)
        => Task.FromResult<UserDto?>(null);

    public Task<UserListItemDto?> FindListItemByIdAsync(
        Guid userId,
        CancellationToken ct = default)
        => Task.FromResult<UserListItemDto?>(null);

    public Task CreateAsync(
        UserDto user, string password,
        CancellationToken ct = default)
        => Task.CompletedTask;

    public Task AssignRoleAsync(
        Guid userId, string role,
        CancellationToken ct = default)
        => Task.CompletedTask;

    public Task<bool> CheckPasswordAsync(
        Guid userId, string password,
        CancellationToken ct = default)
        => Task.FromResult(false);

    public Task AddRefreshTokenAsync(
        Guid userId, string token, DateTime expiresAt,
        CancellationToken ct = default)
        => Task.CompletedTask;

    public Task RevokeAllActiveRefreshTokensAsync(
        Guid userId,
        CancellationToken ct = default)
        => Task.CompletedTask;

    public Task RevokeRefreshTokenAsync(
        Guid userId, string token,
        CancellationToken ct = default)
        => Task.CompletedTask;

    public Task<UserDto?> FindByRefreshTokenAsync(
        string token,
        CancellationToken ct = default)
        => Task.FromResult<UserDto?>(null);

    public Task<bool> RefreshTokenIsActiveAsync(
        string token,
        CancellationToken ct = default)
        => Task.FromResult(false);

    public Task<PagedResult<UserListItemDto>> GetPagedAsync(
    UserQueryParameters parameters,
    CancellationToken ct = default)
    => Task.FromResult(PagedResult<UserListItemDto>.Create(
           Array.Empty<UserListItemDto>(),
           page: 1,
           pageSize: 10,
           totalCount: 0));

    public Task SetIsActiveAsync(
        Guid userId, bool isActive,
        CancellationToken ct = default)
        => Task.CompletedTask;

    public Task SaveChangesAsync(
        CancellationToken ct = default)
        => Task.CompletedTask;
}