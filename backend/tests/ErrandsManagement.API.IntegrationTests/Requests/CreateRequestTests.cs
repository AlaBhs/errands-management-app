using System.Net;
using System.Net.Http.Json;
using ErrandsManagement.API.IntegrationTests.Infrastructure;
using FluentAssertions;

namespace ErrandsManagement.API.IntegrationTests.Requests;

public class CreateRequestTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CreateRequestTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task POST_CreateRequest_Should_Return_201Created()
    {
        // Arrange — seed a real Collaborator so RequesterId from JWT sub resolves
        var userId = await _factory.SeedCollaboratorAsync();
        var client = _factory.CreateAuthenticatedClient("Collaborator", userId);

        var body = new
        {
            title = "Pickup medical samples",
            description = "Collect lab samples from clinic",
            deliveryAddress = new
            {
                street = "12 Rue de Paris",
                city = "Bizerte",
                postalCode = "7000",
                country = "Tunisia",
                note = "Handle with care - fragile"
            },
            priority = 3,
            deadline = (DateTime?)null,
            estimatedCost = (decimal?)null
        };

        // Act
        var response = await client.PostAsJsonAsync(
            "/api/requests",
            body,
            cancellationToken: TestContext.Current.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async Task POST_CreateRequest_Without_Auth_Should_Return_401()
    {
        var client = _factory.CreateClient();

        var body = new
        {
            title = "No auth test",
            description = "Should be rejected",
            deliveryAddress = new { street = "S", city = "C", postalCode = "00000", country = "TN" },
            priority = 1,
        };

        var response = await client.PostAsJsonAsync(
            "/api/requests",
            body,
            cancellationToken: TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task POST_CreateRequest_With_Courier_Role_Should_Return_403()
    {
        var client = _factory.CreateAuthenticatedClient("Courier");

        var body = new
        {
            title = "Courier tries to create",
            description = "Should be forbidden",
            deliveryAddress = new { street = "S", city = "C", postalCode = "00000", country = "TN" },
            priority = 1,
        };

        var response = await client.PostAsJsonAsync(
            "/api/requests",
            body,
            cancellationToken: TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}