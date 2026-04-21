using ErrandsManagement.API.IntegrationTests.Infrastructure;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace ErrandsManagement.API.IntegrationTests.Notifications;

public class NotificationsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public NotificationsControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    // ── GET /api/notifications ────────────────────────────────────────────────

    [Fact]
    public async Task GET_Notifications_Should_Return_200_With_Empty_List_For_New_User()
    {
        var userId = Guid.NewGuid();
        var client = _factory.CreateAuthenticatedClient("Admin", userId);

        var response = await client.GetAsync(
            "/api/notifications",
            TestContext.Current.CancellationToken);

        var collabB = Guid.NewGuid();

        var strangerClient = _factory.CreateAuthenticatedClient("Collaborator", collabB);
        var testResponse = await strangerClient.GetAsync("/api/notifications", TestContext.Current.CancellationToken);
        testResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        json.GetProperty("data").GetProperty("notifications").GetArrayLength()
            .Should().Be(0);
        json.GetProperty("data").GetProperty("unreadCount").GetInt32()
            .Should().Be(0);
    }

    [Fact]
    public async Task GET_Notifications_Should_Return_401_For_Unauthenticated_User()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/api/notifications",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GET_Notifications_Should_Return_Notifications_After_Request_Created()
    {
        var adminId = await _factory.SeedAdminAsync(
            $"notify_admin_{Guid.NewGuid():N}@test.local");

        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"notify_collab_{Guid.NewGuid():N}@test.local");

        var collaboratorClient = _factory.CreateAuthenticatedClient("Collaborator", collaboratorId);
        var adminClient = _factory.CreateAuthenticatedClient("Admin", adminId);

        // Create a request — triggers RequestCreatedEvent → admin gets notified
        await collaboratorClient.PostAsJsonAsync(
            "/api/requests",
            ValidCreateBody(),
            TestContext.Current.CancellationToken);

        var response = await adminClient.GetAsync(
            "/api/notifications",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        var notifications = json.GetProperty("data").GetProperty("notifications");
        notifications.GetArrayLength().Should().BeGreaterThan(0);

        var unreadCount = json.GetProperty("data").GetProperty("unreadCount").GetInt32();
        unreadCount.Should().BeGreaterThan(0);
    }

    // ── POST /api/notifications/{id}/read ─────────────────────────────────────

    [Fact]
    public async Task POST_MarkAsRead_Should_Return_204()
    {
        var adminId = await _factory.SeedAdminAsync(
            $"read_admin_{Guid.NewGuid():N}@test.local");

        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"read_collab_{Guid.NewGuid():N}@test.local");

        var collaboratorClient = _factory.CreateAuthenticatedClient("Collaborator", collaboratorId);
        var adminClient = _factory.CreateAuthenticatedClient("Admin", adminId);

        // Trigger a notification
        await collaboratorClient.PostAsJsonAsync(
            "/api/requests",
            ValidCreateBody(),
            TestContext.Current.CancellationToken);

        // Get the notification id
        var listResponse = await adminClient.GetAsync(
            "/api/notifications",
            TestContext.Current.CancellationToken);

        var json = await listResponse.Content.ReadFromJsonAsync<JsonElement>(
            TestContext.Current.CancellationToken);

        var notificationId = json
            .GetProperty("data")
            .GetProperty("notifications")[0]
            .GetProperty("id")
            .GetGuid();

        // Mark as read
        var response = await adminClient.PostAsync(
            $"/api/notifications/{notificationId}/read",
            null,
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task POST_MarkAsRead_Should_Flip_IsRead_To_True()
    {
        var adminId = await _factory.SeedAdminAsync(
            $"flip_admin_{Guid.NewGuid():N}@test.local");

        var collaboratorId = await _factory.SeedCollaboratorAsync(
            $"flip_collab_{Guid.NewGuid():N}@test.local");

        var collaboratorClient = _factory.CreateAuthenticatedClient("Collaborator", collaboratorId);
        var adminClient = _factory.CreateAuthenticatedClient("Admin", adminId);

        await collaboratorClient.PostAsJsonAsync(
            "/api/requests", ValidCreateBody(), TestContext.Current.CancellationToken);

        var listJson = await (await adminClient.GetAsync(
            "/api/notifications", TestContext.Current.CancellationToken))
            .Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);

        var notificationId = listJson
            .GetProperty("data")
            .GetProperty("notifications")[0]
            .GetProperty("id")
            .GetGuid();

        await adminClient.PostAsync(
            $"/api/notifications/{notificationId}/read",
            null,
            TestContext.Current.CancellationToken);

        // Fetch again — isRead should be true, unreadCount should decrease
        var updatedJson = await (await adminClient.GetAsync(
            "/api/notifications", TestContext.Current.CancellationToken))
            .Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);

        var notification = updatedJson
            .GetProperty("data")
            .GetProperty("notifications")
            .EnumerateArray()
            .First(n => n.GetProperty("id").GetGuid() == notificationId);

        notification.GetProperty("isRead").GetBoolean().Should().BeTrue();
    }

    [Fact]
    public async Task POST_MarkAsRead_Should_Return_404_For_Nonexistent_Notification()
    {
        var adminClient = _factory.CreateAuthenticatedClient("Admin");

        var response = await adminClient.PostAsync(
            $"/api/notifications/{Guid.NewGuid()}/read",
            null,
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task POST_MarkAsRead_Should_Return_401_For_Unauthenticated_User()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsync(
            $"/api/notifications/{Guid.NewGuid()}/read",
            null,
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static object ValidCreateBody() => new
    {
        title = "Notification Test Request",
        description = "Testing notifications end to end",
        deliveryAddress = new
        {
            street = "12 Main Street",
            city = "Tunis",
            postalCode = "1000",
            country = "Tunisia"
        },
        priority = 2
    };
}