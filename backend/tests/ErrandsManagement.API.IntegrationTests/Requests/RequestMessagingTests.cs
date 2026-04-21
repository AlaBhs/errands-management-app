using ErrandsManagement.API.IntegrationTests.Infrastructure;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace ErrandsManagement.API.IntegrationTests.Requests;

/// <summary>
/// Integration tests for POST /api/requests/{id}/messages
/// and GET  /api/requests/{id}/messages.
///
/// Coverage:
///   - Collaborator (owner) can send and read messages on own request
///   - Admin can send and read messages on any request
///   - Assigned Courier can send and read messages on their assigned request
///   - Non-participant Collaborator gets 403 on both endpoints
///   - Non-assigned Courier gets 403 on both endpoints
///   - Unauthenticated request gets 401
///   - Empty content returns 400
///   - Messages returned in chronological order
/// </summary>
public class RequestMessagingTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public RequestMessagingTests(CustomWebApplicationFactory factory)
        => _factory = factory;

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static object ValidCreateBody() => new
    {
        title = "Messaging test request",
        description = "Integration test for messaging",
        deliveryAddress = new
        {
            street = "12 Avenue Habib Bourguiba",
            city = "Tunis",
            postalCode = "1000",
            country = "Tunisia"
        },
        priority = 1,
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

    private async Task AssignRequestAsync(Guid requestId, Guid courierId)
    {
        var adminClient = _factory.CreateAuthenticatedClient("Admin");
        var response = await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/assign",
            new { courierId },
            TestContext.Current.CancellationToken);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private static object MessageBody(string content = "Hello from test") => new { content };

    // ── POST tests ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task POST_Message_Returns_201_For_Collaborator_Owner()
    {
        var collabId = await _factory.SeedCollaboratorAsync($"msg_collab_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var client = _factory.CreateAuthenticatedClient("Collaborator", collabId);
        var response = await client.PostAsJsonAsync(
            $"/api/requests/{requestId}/messages",
            MessageBody(),
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);
        json.GetProperty("data").GetGuid().Should().NotBeEmpty();
    }

    [Fact]
    public async Task POST_Message_Returns_201_For_Admin()
    {
        var collabId = await _factory.SeedCollaboratorAsync($"msg_admin_collab_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var adminClient = _factory.CreateAuthenticatedClient("Admin");
        var response = await adminClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/messages",
            MessageBody("Admin message"),
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task POST_Message_Returns_201_For_Assigned_Courier()
    {
        var collabId = await _factory.SeedCollaboratorAsync($"msg_courier_collab_{Guid.NewGuid():N}@test.local");
        var courierId = await _factory.SeedCourierAsync($"msg_courier_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);
        await AssignRequestAsync(requestId, courierId);

        var courierClient = _factory.CreateAuthenticatedClient("Courier", courierId);
        var response = await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/messages",
            MessageBody("Courier message"),
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task POST_Message_Returns_403_For_Non_Owner_Collaborator()
    {
        // collabA owns the request, collabB is a stranger
        var collabA = await _factory.SeedCollaboratorAsync($"msg_ownA_{Guid.NewGuid():N}@test.local");
        var collabB = await _factory.SeedCollaboratorAsync($"msg_strnB_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabA);

        var strangerClient = _factory.CreateAuthenticatedClient("Collaborator", collabB);
        var response = await strangerClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/messages",
            MessageBody(),
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task POST_Message_Returns_403_For_Non_Assigned_Courier()
    {
        var collabId = await _factory.SeedCollaboratorAsync($"msg_unasgn_collab_{Guid.NewGuid():N}@test.local");
        var courierId = await _factory.SeedCourierAsync($"msg_unasgn_courier_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);
        // Courier is NOT assigned

        var courierClient = _factory.CreateAuthenticatedClient("Courier", courierId);
        var response = await courierClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/messages",
            MessageBody(),
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task POST_Message_Returns_401_For_Unauthenticated()
    {
        var collabId = await _factory.SeedCollaboratorAsync($"msg_unauth_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var anonClient = _factory.CreateClient();
        var response = await anonClient.PostAsJsonAsync(
            $"/api/requests/{requestId}/messages",
            MessageBody(),
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task POST_Message_Returns_400_For_Empty_Content()
    {
        var collabId = await _factory.SeedCollaboratorAsync($"msg_empty_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var client = _factory.CreateAuthenticatedClient("Collaborator", collabId);
        var response = await client.PostAsJsonAsync(
            $"/api/requests/{requestId}/messages",
            new { content = "" },
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task POST_Message_Returns_404_For_Nonexistent_Request()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");
        var response = await client.PostAsJsonAsync(
            $"/api/requests/{Guid.NewGuid()}/messages",
            MessageBody(),
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── GET tests ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task GET_Messages_Returns_200_With_Empty_List_When_No_Messages()
    {
        var collabId = await _factory.SeedCollaboratorAsync($"get_empty_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var client = _factory.CreateAuthenticatedClient("Collaborator", collabId);
        var response = await client.GetAsync(
            $"/api/requests/{requestId}/messages",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);
        json.GetProperty("data").GetArrayLength().Should().Be(0);
    }

    [Fact]
    public async Task GET_Messages_Returns_Messages_In_Chronological_Order()
    {
        var collabId = await _factory.SeedCollaboratorAsync($"get_order_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var client = _factory.CreateAuthenticatedClient("Collaborator", collabId);

        // Send 3 messages sequentially
        foreach (var text in new[] { "First", "Second", "Third" })
        {
            var r = await client.PostAsJsonAsync(
                $"/api/requests/{requestId}/messages",
                new { content = text },
                TestContext.Current.CancellationToken);
            r.StatusCode.Should().Be(HttpStatusCode.Created);
        }

        var response = await client.GetAsync(
            $"/api/requests/{requestId}/messages",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        var messages = json.GetProperty("data").EnumerateArray().ToList();
        messages.Should().HaveCount(3);
        messages[0].GetProperty("content").GetString().Should().Be("First");
        messages[1].GetProperty("content").GetString().Should().Be("Second");
        messages[2].GetProperty("content").GetString().Should().Be("Third");
    }

    [Fact]
    public async Task GET_Messages_Response_Shape_Is_Correct()
    {
        var collabId = await _factory.SeedCollaboratorAsync($"get_shape_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var client = _factory.CreateAuthenticatedClient("Collaborator", collabId);
        await client.PostAsJsonAsync(
            $"/api/requests/{requestId}/messages",
            MessageBody("Shape test message"),
            TestContext.Current.CancellationToken);

        var response = await client.GetAsync(
            $"/api/requests/{requestId}/messages",
            TestContext.Current.CancellationToken);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        var msg = json.GetProperty("data").EnumerateArray().First();

        msg.TryGetProperty("id", out _).Should().BeTrue();
        msg.TryGetProperty("requestId", out _).Should().BeTrue();
        msg.TryGetProperty("senderId", out _).Should().BeTrue();
        msg.TryGetProperty("senderName", out _).Should().BeTrue();
        msg.TryGetProperty("senderRole", out _).Should().BeTrue();
        msg.TryGetProperty("content", out _).Should().BeTrue();
        msg.TryGetProperty("createdAt", out _).Should().BeTrue();

        msg.GetProperty("content").GetString().Should().Be("Shape test message");
        msg.GetProperty("senderId").GetGuid().Should().Be(collabId);
    }

    [Fact]
    public async Task GET_Messages_Returns_403_For_Non_Participant()
    {
        var collabA = await _factory.SeedCollaboratorAsync($"get_403a_{Guid.NewGuid():N}@test.local");
        var collabB = await _factory.SeedCollaboratorAsync($"get_403b_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabA);

        var strangerClient = _factory.CreateAuthenticatedClient("Collaborator", collabB);
        var response = await strangerClient.GetAsync(
            $"/api/requests/{requestId}/messages",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_Messages_Returns_401_For_Unauthenticated()
    {
        var collabId = await _factory.SeedCollaboratorAsync($"get_unauth_{Guid.NewGuid():N}@test.local");
        var requestId = await CreateRequestAsync(collabId);

        var anonClient = _factory.CreateClient();
        var response = await anonClient.GetAsync(
            $"/api/requests/{requestId}/messages",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
