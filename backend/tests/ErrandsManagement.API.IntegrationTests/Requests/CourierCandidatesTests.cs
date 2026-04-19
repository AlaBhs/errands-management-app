using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using ErrandsManagement.API.IntegrationTests.Infrastructure;
using FluentAssertions;

namespace ErrandsManagement.API.IntegrationTests.Requests;

public class CourierCandidatesTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CourierCandidatesTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private static object ValidCreateBody() => new
    {
        title = "Test delivery",
        description = "Integration test",
        deliveryAddress = new
        {
            street = "12 Avenue Habib Bourguiba",
            city = "Tunis",
            postalCode = "1000",
            country = "Tunisia"
        },
        priority = 1,   // Normal
        category = 0
    };

    private async Task<Guid> CreateRequestAsync(Guid collaboratorId)
    {
        var client = _factory.CreateAuthenticatedClient("Collaborator", collaboratorId);
        var response = await client.PostAsJsonAsync(
            "/api/requests", ValidCreateBody(),
            TestContext.Current.CancellationToken);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);
        return json.GetProperty("data").GetGuid();
    }

    [Fact]
    public async Task GET_Candidates_Returns_200_For_Admin()
    {
        var collabId = await _factory.SeedCollaboratorAsync(
            $"cand_admin_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");

        var response = await adminClient.GetAsync(
            $"/api/requests/{requestId}/candidates",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_Candidates_Returns_403_For_Collaborator()
    {
        var collabId = await _factory.SeedCollaboratorAsync(
            $"cand_collab_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var collabClient = _factory.CreateAuthenticatedClient("Collaborator", collabId);

        var response = await collabClient.GetAsync(
            $"/api/requests/{requestId}/candidates",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_Candidates_Returns_403_For_Courier()
    {
        var collabId = await _factory.SeedCollaboratorAsync(
            $"cand_courier_collab_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var courierClient = _factory.CreateAuthenticatedClient("Courier");

        var response = await courierClient.GetAsync(
            $"/api/requests/{requestId}/candidates",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_Candidates_Response_Shape_Matches_CourierScoreDto()
    {
        var collabId = await _factory.SeedCollaboratorAsync(
            $"cand_shape_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");

        var response = await adminClient.GetAsync(
            $"/api/requests/{requestId}/candidates",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        var data = json.GetProperty("data");
        data.ValueKind.Should().Be(JsonValueKind.Array);

        // If there are candidates, validate each item's shape
        foreach (var item in data.EnumerateArray())
        {
            item.TryGetProperty("courierId", out _).Should().BeTrue();
            item.TryGetProperty("fullName", out _).Should().BeTrue();
            item.TryGetProperty("email", out _).Should().BeTrue();
            item.TryGetProperty("totalScore", out _).Should().BeTrue();
            item.TryGetProperty("activeAssignmentsCount", out _).Should().BeTrue();
            item.TryGetProperty("scoreBreakdown", out var breakdown).Should().BeTrue();
            breakdown.TryGetProperty("availabilityScore", out _).Should().BeTrue();
            breakdown.TryGetProperty("proximityScore", out _).Should().BeTrue();
            breakdown.TryGetProperty("performanceScore", out _).Should().BeTrue();
        }
    }

    [Fact]
    public async Task GET_Candidates_Returns_404_For_Nonexistent_Request()
    {
        var adminClient = _factory.CreateAuthenticatedClient("Admin");

        var response = await adminClient.GetAsync(
            $"/api/requests/{Guid.NewGuid()}/candidates",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}