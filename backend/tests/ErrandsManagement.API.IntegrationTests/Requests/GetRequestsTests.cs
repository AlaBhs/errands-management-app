using System.Net;
using ErrandsManagement.API.IntegrationTests.Infrastructure;
using FluentAssertions;

namespace ErrandsManagement.API.IntegrationTests.Requests;

public class GetRequestsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public GetRequestsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    // ── GET /api/requests — Admin only ────────────────────────────────────────

    [Fact]
    public async Task GET_Requests_As_Admin_Should_Return_200()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/requests",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_Requests_As_Collaborator_Should_Return_403()
    {
        var client = _factory.CreateAuthenticatedClient("Collaborator");

        var response = await client.GetAsync(
            "/api/requests",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_Requests_As_Courier_Should_Return_403()
    {
        var client = _factory.CreateAuthenticatedClient("Courier");

        var response = await client.GetAsync(
            "/api/requests",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_Requests_Without_Auth_Should_Return_401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/api/requests",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── GET /api/requests/mine — Collaborator only ────────────────────────────

    [Fact]
    public async Task GET_Requests_Mine_As_Collaborator_Should_Return_200()
    {
        var client = _factory.CreateAuthenticatedClient("Collaborator");

        var response = await client.GetAsync(
            "/api/requests/mine",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_Requests_Mine_As_Admin_Should_Return_403()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/requests/mine",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_Requests_Mine_Without_Auth_Should_Return_401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/api/requests/mine",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── GET /api/requests/assignments — Courier only ──────────────────────────

    [Fact]
    public async Task GET_Requests_Assignments_As_Courier_Should_Return_200()
    {
        var client = _factory.CreateAuthenticatedClient("Courier");

        var response = await client.GetAsync(
            "/api/requests/assignments",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GET_Requests_Assignments_As_Admin_Should_Return_403()
    {
        var client = _factory.CreateAuthenticatedClient("Admin");

        var response = await client.GetAsync(
            "/api/requests/assignments",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GET_Requests_Assignments_Without_Auth_Should_Return_401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(
            "/api/requests/assignments",
            TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}