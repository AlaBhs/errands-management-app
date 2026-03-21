using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Analytics.Queries.GetCourierPerformance;
using ErrandsManagement.Application.Interfaces;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Analytics.Queries;

public class GetCourierPerformanceHandlerTests
{
    private readonly Mock<IAnalyticsRepository> _repoMock = new();
    private readonly GetCourierPerformanceHandler _handler;

    public GetCourierPerformanceHandlerTests()
    {
        _handler = new GetCourierPerformanceHandler(_repoMock.Object);
    }

    private static IReadOnlyList<CourierPerformanceDto> SamplePerformance() =>
    [
        new CourierPerformanceDto(
            CourierId:           Guid.NewGuid(),
            CourierName:         "Ali Ben Salem",
            TotalAssignments:    10,
            Completed:           9,
            Cancelled:           1,
            AvgExecutionMinutes: 85.0,
            AvgRating:           4.5,
            OnTimeRate:          88.9),
        new CourierPerformanceDto(
            CourierId:           Guid.NewGuid(),
            CourierName:         "Karim Trabelsi",
            TotalAssignments:    8,
            Completed:           7,
            Cancelled:           0,
            AvgExecutionMinutes: 110.0,
            AvgRating:           3.8,
            OnTimeRate:          71.4),
    ];

    [Fact]
    public async Task Handle_Should_Return_Performance_List_From_Repository()
    {
        var expected = SamplePerformance();
        _repoMock
            .Setup(r => r.GetCourierPerformanceAsync(null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _handler.Handle(
            new GetCourierPerformanceQuery(null, null),
            CancellationToken.None);

        result.Should().BeEquivalentTo(expected);
    }

    [Fact]
    public async Task Handle_Should_Pass_From_And_To_To_Repository()
    {
        var from = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var to = new DateTime(2025, 12, 31, 0, 0, 0, DateTimeKind.Utc);

        _repoMock
            .Setup(r => r.GetCourierPerformanceAsync(from, to, It.IsAny<CancellationToken>()))
            .ReturnsAsync(SamplePerformance());

        await _handler.Handle(
            new GetCourierPerformanceQuery(from, to),
            CancellationToken.None);

        _repoMock.Verify(
            r => r.GetCourierPerformanceAsync(from, to, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Return_Empty_List_When_No_Couriers()
    {
        _repoMock
            .Setup(r => r.GetCourierPerformanceAsync(
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<CourierPerformanceDto>());

        var result = await _handler.Handle(
            new GetCourierPerformanceQuery(null, null),
            CancellationToken.None);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_Should_Call_Repository_Exactly_Once()
    {
        _repoMock
            .Setup(r => r.GetCourierPerformanceAsync(
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(SamplePerformance());

        await _handler.Handle(
            new GetCourierPerformanceQuery(null, null),
            CancellationToken.None);

        _repoMock.Verify(
            r => r.GetCourierPerformanceAsync(
                It.IsAny<DateTime?>(),
                It.IsAny<DateTime?>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}