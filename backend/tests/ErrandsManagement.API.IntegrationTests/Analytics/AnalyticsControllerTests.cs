using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using ErrandsManagement.API.IntegrationTests.Infrastructure;
using FluentAssertions;

namespace ErrandsManagement.API.IntegrationTests.Analytics;

/// <summary>
/// Integration tests for the analytics endpoints.
/// All four endpoints are Admin-only — tests verify authorization
/// for each role and response shape for valid Admin requests.
/// </summary>
public class AnalyticsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AnalyticsControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    // ── GET /api/analytics/summary ────────────────────────────────────────────

    [Fact]
    public async Task GET_Summary_Should_Return_200_For_Admin()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/summary",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_Summary_Should_Return_403_For_Collaborator()
    {
        var client = _factory.CreateAuthenticatedClient("Collaborator");

        var response = await client.GetAsync(
            "/api/analytics/summary",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_Summary_Should_Return_403_For_Courier()
    {
        var client = _factory.CreateAuthenticatedClient("Courier");

        var response = await client.GetAsync(
            "/api/analytics/summary",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_Summary_Should_Return_401_For_Anonymous()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/api/analytics/summary",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GET_Summary_Should_Return_Valid_Shape()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/summary",
            TestContext.Current.CancellationToken);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        json.GetProperty("totalRequests").GetInt32().Should().BeGreaterThanOrEqualTo(0);
        json.GetProperty("byStatus").ValueKind.Should().Be(JsonValueKind.Object);
        json.GetProperty("byCategory").ValueKind.Should().Be(JsonValueKind.Object);
        json.GetProperty("totalEstimatedCost").GetDecimal().Should().BeGreaterThanOrEqualTo(0);
        json.GetProperty("totalActualCost").GetDecimal().Should().BeGreaterThanOrEqualTo(0);
    }

    [Fact]
    public async Task GET_Summary_With_Future_From_Should_Return_Zero_Requests()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");
        var future = DateTime.UtcNow.AddYears(1).ToString("yyyy-MM-dd");

        var response = await client.GetAsync(
            $"/api/analytics/summary?from={future}",
            TestContext.Current.CancellationToken);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        json.GetProperty("totalRequests").GetInt32().Should().Be(0);
    }

    // ── GET /api/analytics/trend ──────────────────────────────────────────────

    [Fact]
    public async Task GET_Trend_Should_Return_200_For_Admin()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/trend",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_Trend_Should_Return_403_For_Collaborator()
    {
        var client = _factory.CreateAuthenticatedClient("Collaborator");

        var response = await client.GetAsync(
            "/api/analytics/trend",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_Trend_Should_Return_401_For_Anonymous()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/api/analytics/trend",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GET_Trend_Should_Return_Six_Points_By_Default()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/trend",
            TestContext.Current.CancellationToken);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        json.GetArrayLength().Should().Be(6);
    }

    [Fact]
    public async Task GET_Trend_With_Custom_Range_Should_Return_Correct_Month_Count()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/trend?from=2024-01-01&to=2024-03-31",
            TestContext.Current.CancellationToken);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        // Jan, Feb, Mar = 3 months
        json.GetArrayLength().Should().Be(3);
    }

    [Fact]
    public async Task GET_Trend_Points_Should_Have_Year_Month_Count_Properties()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/trend",
            TestContext.Current.CancellationToken);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        var first = json[0];
        first.GetProperty("year").GetInt32().Should().BeGreaterThan(2000);
        first.GetProperty("month").GetInt32().Should().BeInRange(1, 12);
        first.GetProperty("count").GetInt32().Should().BeGreaterThanOrEqualTo(0);
    }

    // ── GET /api/analytics/cost-breakdown ─────────────────────────────────────

    [Fact]
    public async Task GET_CostBreakdown_Should_Return_200_For_Admin()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/cost-breakdown",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_CostBreakdown_Should_Return_403_For_Collaborator()
    {
        var client = _factory.CreateAuthenticatedClient("Collaborator");

        var response = await client.GetAsync(
            "/api/analytics/cost-breakdown",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_CostBreakdown_Should_Return_401_For_Anonymous()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/api/analytics/cost-breakdown",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GET_CostBreakdown_Should_Return_Array()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/cost-breakdown",
            TestContext.Current.CancellationToken);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        json.ValueKind.Should().Be(JsonValueKind.Array);
    }

    [Fact]
    public async Task GET_CostBreakdown_Items_Should_Have_Required_Properties()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/cost-breakdown",
            TestContext.Current.CancellationToken);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        // Only validate shape if there is data — empty array is also valid
        if (json.GetArrayLength() > 0)
        {
            var first = json[0];
            first.GetProperty("category").GetString().Should().NotBeNullOrEmpty();
            first.GetProperty("estimatedCost").GetDecimal().Should().BeGreaterThanOrEqualTo(0);
            first.GetProperty("actualCost").GetDecimal().Should().BeGreaterThanOrEqualTo(0);
        }
    }

    // ── GET /api/analytics/courier-performance ────────────────────────────────

    [Fact]
    public async Task GET_CourierPerformance_Should_Return_200_For_Admin()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/courier-performance",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_CourierPerformance_Should_Return_403_For_Courier()
    {
        var client = _factory.CreateAuthenticatedClient("Courier");

        var response = await client.GetAsync(
            "/api/analytics/courier-performance",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_CourierPerformance_Should_Return_403_For_Collaborator()
    {
        var client = _factory.CreateAuthenticatedClient("Collaborator");

        var response = await client.GetAsync(
            "/api/analytics/courier-performance",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_CourierPerformance_Should_Return_401_For_Anonymous()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/api/analytics/courier-performance",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GET_CourierPerformance_Should_Return_Array()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/courier-performance",
            TestContext.Current.CancellationToken);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        json.ValueKind.Should().Be(JsonValueKind.Array);
    }

    [Fact]
    public async Task GET_CourierPerformance_Items_Should_Have_Required_Properties()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/analytics/courier-performance",
            TestContext.Current.CancellationToken);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        if (json.GetArrayLength() > 0)
        {
            var first = json[0];
            first.GetProperty("courierId").GetGuid().Should().NotBeEmpty();
            first.GetProperty("courierName").GetString().Should().NotBeNullOrEmpty();
            first.GetProperty("totalAssignments").GetInt32().Should().BeGreaterThanOrEqualTo(0);
            first.GetProperty("completed").GetInt32().Should().BeGreaterThanOrEqualTo(0);
            first.GetProperty("cancelled").GetInt32().Should().BeGreaterThanOrEqualTo(0);
        }
    }
}