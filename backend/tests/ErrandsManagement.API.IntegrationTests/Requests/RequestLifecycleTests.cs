using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using ErrandsManagement.API.IntegrationTests.Infrastructure;
using FluentAssertions;

namespace ErrandsManagement.API.IntegrationTests.Requests;

/// <summary>
/// Integration tests for the full request lifecycle:
/// Create → Assign → Start → Complete → Survey
/// and the Cancel and GetById endpoints.
/// Each test seeds its own data to stay independent.
/// </summary>
public class RequestLifecycleTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public RequestLifecycleTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static object ValidCreateBody() => new
    {
        title = "Deliver package",
        description = "Urgent delivery needed",
        deliveryAddress = new
        {
            street = "12 Main Street",
            city = "Tunis",
            postalCode = "1000",
            country = "Tunisia"
        },
        priority = 2
    };

    /// <summary>
    /// Creates a request as a Collaborator and returns its Id.
    /// </summary>
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

    // ── GET /api/requests/{id} ────────────────────────────────────────────────

    [Fact]
    public async Task GET_RequestById_Should_Return_200_With_Data()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"get_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var client = _factory.CreateAuthenticatedClient("Admin");
        var response = await client.GetAsync(
            $"/api/requests/{requestId}",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);
        json.GetProperty("data").GetProperty("id").GetGuid().Should().Be(requestId);
        json.GetProperty("data").GetProperty("title").GetString().Should().Be("Deliver package");
    }

    [Fact]
    public async Task GET_RequestById_Should_Return_404_When_Not_Found()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            $"/api/requests/{Guid.NewGuid()}",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── POST /api/requests/{id}/assign ────────────────────────────────────────

    [Fact]
    public async Task POST_Assign_Should_Return_204()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"assign_{Guid.NewGuid():N}@test.local");
        var courierId = await _factory.SeedCourierAsync(
            $"courier_assign_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");
        var response = await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/assign",
            new { courierId },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task POST_Assign_Should_Return_404_When_Request_Not_Found()
    {
        var adminClient = _factory.CreateAuthenticatedClient("Admin");

        var response = await adminClient.PostAsJsonAsync(
            $"/api/requests/{Guid.NewGuid()}/assign",
            new { courierId = Guid.NewGuid() },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task POST_Assign_Twice_Should_Return_400()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"assign2_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");
        await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/assign",
            new { courierId = Guid.NewGuid() },
            TestContext.Current.CancellationToken);

        // Second assign on an already-assigned request — domain throws
        var response = await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/assign",
            new { courierId = Guid.NewGuid() },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── POST /api/requests/{id}/start ─────────────────────────────────────────

    [Fact]
    public async Task POST_Start_Should_Return_200()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"start_{Guid.NewGuid():N}@test.local");
        var courierId = await _factory.SeedCourierAsync(
            $"courier_start_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");
        var courierClient = _factory.CreateAuthenticatedClient("Courier", courierId);

        await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/assign",
            new { courierId },
            TestContext.Current.CancellationToken);

        var response = await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/start",
            new { },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task POST_Start_On_Pending_Request_Should_Return_400()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"start_bad_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        // Not assigned yet — domain will throw InvalidRequestStateException
        var courierClient = _factory.CreateAuthenticatedClient("Courier");
        var response = await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/start",
            new { },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── POST /api/requests/{id}/complete ──────────────────────────────────────

    [Fact]
    public async Task POST_Complete_Should_Return_200()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"complete_{Guid.NewGuid():N}@test.local");
        var courierId = await _factory.SeedCourierAsync(
            $"courier_complete_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");
        var courierClient = _factory.CreateAuthenticatedClient("Courier", courierId);

        await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/assign",
            new { courierId },
            TestContext.Current.CancellationToken);

        await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/start",
            new { },
            TestContext.Current.CancellationToken);

        var response = await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/complete",
            new { actualCost = 25.50, note = "Delivered successfully" },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task POST_Complete_On_Pending_Request_Should_Return_400()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"complete_bad_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var courierClient = _factory.CreateAuthenticatedClient("Courier");
        var response = await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/complete",
            new { actualCost = (decimal?)null, note = (string?)null },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── POST /api/requests/{id}/cancel ────────────────────────────────────────

    [Fact]
    public async Task POST_Cancel_Pending_Request_Should_Return_200()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"cancel_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");
        var response = await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/cancel",
            new { reason = "" },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task POST_Cancel_InProgress_Request_Without_Reason_Should_Return_400()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"cancel_bad_{Guid.NewGuid():N}@test.local");
        var courierId = await _factory.SeedCourierAsync(
            $"courier_cancel_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");
        var courierClient = _factory.CreateAuthenticatedClient("Courier", courierId);

        await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/assign",
            new { courierId },
            TestContext.Current.CancellationToken);

        await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/start",
            new { },
            TestContext.Current.CancellationToken);

        // InProgress + no reason → domain throws
        var response = await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/cancel",
            new { reason = "" },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── POST /api/requests/{id}/survey ────────────────────────────────────────

    [Fact]
    public async Task POST_Survey_Should_Return_200_After_Completion()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"survey_{Guid.NewGuid():N}@test.local");
        var courierId = await _factory.SeedCourierAsync(
            $"courier_survey_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");
        var courierClient = _factory.CreateAuthenticatedClient("Courier", courierId);
        var collaboratorClient = _factory.CreateAuthenticatedClient("Collaborator", collaboratorId);

        await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/assign",
            new { courierId },
            TestContext.Current.CancellationToken);

        await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/start",
            new { },
            TestContext.Current.CancellationToken);

        await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/complete",
            new { actualCost = (decimal?)null, note = (string?)null },
            TestContext.Current.CancellationToken);

        var response = await collaboratorClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/survey",
            new { rating = 5, comment = "Great service" },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task POST_Survey_On_Pending_Request_Should_Return_400()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"survey_bad_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var collaboratorClient = _factory.CreateAuthenticatedClient("Collaborator", collaboratorId);
        var response = await collaboratorClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/survey",
            new { rating = 5, comment = "Too early" },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_Survey_Twice_Should_Return_400()
    {
        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"survey2_{Guid.NewGuid():N}@test.local");
        var courierId = await _factory.SeedCourierAsync(
            $"courier_survey2_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collaboratorId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");
        var courierClient = _factory.CreateAuthenticatedClient("Courier", courierId);
        var collaboratorClient = _factory.CreateAuthenticatedClient("Collaborator", collaboratorId);

        await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/assign",
            new { courierId },
            TestContext.Current.CancellationToken);
        await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/start",
            new { },
            TestContext.Current.CancellationToken);
        await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/complete",
            new { actualCost = (decimal?)null, note = (string?)null },
            TestContext.Current.CancellationToken);
        await collaboratorClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/survey",
            new { rating = 5, comment = "First" },
            TestContext.Current.CancellationToken);

        // Second survey — domain throws SurveyNotAllowedException
        var response = await collaboratorClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/survey",
            new { rating = 3, comment = "Second" },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}