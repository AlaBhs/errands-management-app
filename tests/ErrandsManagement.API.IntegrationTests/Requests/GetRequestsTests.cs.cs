using System.Net;
using ErrandsManagement.API.IntegrationTests.Infrastructure;
using FluentAssertions;

namespace ErrandsManagement.API.IntegrationTests.Requests;

public class GetRequestsTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public GetRequestsTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GET_Requests_Should_Return_200()
    {
        var response = await _client.GetAsync("/api/requests", TestContext.Current.CancellationToken);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}