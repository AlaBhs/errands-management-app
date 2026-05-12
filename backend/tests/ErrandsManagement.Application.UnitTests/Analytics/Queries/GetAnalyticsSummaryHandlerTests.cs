using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Analytics.Queries.GetAnalyticsSummary;
using ErrandsManagement.Application.Interfaces;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Analytics.Queries;

public class GetAnalyticsSummaryHandlerTests
{
    private readonly Mock<IAnalyticsRepository> _repoMock = new();
    private readonly GetAnalyticsSummaryHandler _handler;

    public GetAnalyticsSummaryHandlerTests()
    {
        _handler = new GetAnalyticsSummaryHandler(_repoMock.Object);
    }

    private static AnalyticsSummaryDto SampleDto() => new(
        TotalRequests: 10,
        ByStatus: new Dictionary<string, int> { ["Completed"] = 8, ["Pending"] = 2 },
        ByCategory: new Dictionary<string, int> { ["Travel"] = 5, ["Other"] = 5 },
        AvgLifecycleMinutes: 120.0,
        AvgExecutionMinutes: 45.0,
        AvgQueueWaitMinutes: 60.0,
        AvgPickupDelayMinutes: 15.0,
        AvgSurveyRating: 4.5,
        DeadlineComplianceRate: 80.0,
        TotalEstimatedCost: 500m,
        TotalActualCost: 480m);

    [Fact]
    public async Task Handle_Should_Return_Dto_From_Repository()
    {
        var expected = SampleDto();
        _repoMock
            .Setup(r => r.GetSummaryAsync(null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _handler.Handle(
            new GetAnalyticsSummaryQuery(null, null),
            CancellationToken.None);

        result.Should().BeEquivalentTo(expected);
    }

    [Fact]
    public async Task Handle_Should_Pass_From_And_To_To_Repository()
    {
        var from = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc);

        _repoMock
            .Setup(r => r.GetSummaryAsync(from, to, It.IsAny<CancellationToken>()))
            .ReturnsAsync(SampleDto());

        await _handler.Handle(
            new GetAnalyticsSummaryQuery(from, to),
            CancellationToken.None);

        _repoMock.Verify(
            r => r.GetSummaryAsync(from, to, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Call_Repository_Exactly_Once()
    {
        _repoMock
            .Setup(r => r.GetSummaryAsync(
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(SampleDto());

        await _handler.Handle(
            new GetAnalyticsSummaryQuery(null, null),
            CancellationToken.None);

        _repoMock.Verify(
            r => r.GetSummaryAsync(
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}