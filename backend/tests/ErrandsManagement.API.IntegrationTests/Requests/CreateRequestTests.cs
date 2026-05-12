using System.Net;
using System.Net.Http.Json;
using ErrandsManagement.API.IntegrationTests.Infrastructure;
using FluentAssertions;

namespace ErrandsManagement.API.IntegrationTests.Requests;

public class CreateRequestTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CreateRequestTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task POST_CreateRequest_Should_Return_201Created()
    {
        var request = new
        {
            title = "Pickup medical samples",
            description = "Collect lab samples from clinic",
            requesterId = Guid.NewGuid(),
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

        var response = await _client.PostAsJsonAsync(
            "/api/requests",
            request,
            cancellationToken: TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}