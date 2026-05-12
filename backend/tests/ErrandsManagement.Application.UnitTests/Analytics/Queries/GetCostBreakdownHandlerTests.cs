using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Analytics.Queries.GetCostBreakdown;
using ErrandsManagement.Application.Interfaces;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Analytics.Queries;

public class GetCostBreakdownHandlerTests
{
    private readonly Mock<IAnalyticsRepository> _repoMock = new();
    private readonly GetCostBreakdownHandler _handler;

    public GetCostBreakdownHandlerTests()
    {
        _handler = new GetCostBreakdownHandler(_repoMock.Object);
    }

    private static IReadOnlyList<CostBreakdownDto> SampleBreakdown() =>
    [
        new CostBreakdownDto("Travel",         200m, 185m),
        new CostBreakdownDto("OfficeSupplies",  80m,  90m),
        new CostBreakdownDto("Facilities",      50m,  50m),
    ];

    [Fact]
    public async Task Handle_Should_Return_Breakdown_From_Repository()
    {
        var expected = SampleBreakdown();
        _repoMock
            .Setup(r => r.GetCostBreakdownAsync(null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _handler.Handle(
            new GetCostBreakdownQuery(null, null),
            CancellationToken.None);

        result.Should().BeEquivalentTo(expected);
    }

    [Fact]
    public async Task Handle_Should_Pass_From_And_To_To_Repository()
    {
        var from = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = new DateTime(2025, 3, 31, 0, 0, 0, DateTimeKind.Utc);

        _repoMock
            .Setup(r => r.GetCostBreakdownAsync(from, to, It.IsAny<CancellationToken>()))
            .ReturnsAsync(SampleBreakdown());

        await _handler.Handle(
            new GetCostBreakdownQuery(from, to),
            CancellationToken.None);

        _repoMock.Verify(
            r => r.GetCostBreakdownAsync(from, to, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Return_Empty_List_When_No_Cost_Data()
    {
        _repoMock
            .Setup(r => r.GetCostBreakdownAsync(
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<CostBreakdownDto>());

        var result = await _handler.Handle(
            new GetCostBreakdownQuery(null, null),
            CancellationToken.None);

        result.Should().BeEmpty();
    }
}