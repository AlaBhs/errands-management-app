using ErrandsManagement.Domain.ValueObjects;
using FluentAssertions;

namespace ErrandsManagement.Domain.UnitTests.Scoring;

public class CourierScoringTests
{
    // ── Availability ─────────────────────────────────────────────────────────

    [Fact]
    public void Availability_ZeroActive_Returns100()
        => CourierScoring.ComputeAvailabilityScore(0, 3)
            .Should().Be(100.0);

    [Fact]
    public void Availability_AtMax_Returns0()
        => CourierScoring.ComputeAvailabilityScore(3, 3)
            .Should().Be(0.0);

    [Fact]
    public void Availability_OneOfThree_Returns67()
        => CourierScoring.ComputeAvailabilityScore(1, 3)
            .Should().BeApproximately(66.67, 0.1);

    [Fact]
    public void Availability_ExceedsMax_ReturnsZero()
        => CourierScoring.ComputeAvailabilityScore(5, 3)
            .Should().Be(0.0);

    // ── Proximity ────────────────────────────────────────────────────────────

    [Fact]
    public void Proximity_ZeroDistance_Returns100()
    {
        var score = CourierScoring.ComputeProximityScore(
            36.8065, 10.1815, 36.8065, 10.1815, 20.0, out var dist);

        score.Should().BeApproximately(100.0, 0.01);
        dist.Should().BeApproximately(0.0, 0.01);
    }

    [Fact]
    public void Proximity_AtMaxDistance_ReturnsZero()
    {
        var score = CourierScoring.ComputeProximityScore(
            36.8065, 10.1815, 36.9864, 10.1815, 20.0, out var dist);

        score.Should().Be(0.0);
        dist.Should().BeGreaterThanOrEqualTo(20.0);
    }

    [Fact]
    public void Proximity_NoCourierLocation_ReturnsZero()
    {
        var score = CourierScoring.ComputeProximityScore(
            null, null, 36.8065, 10.1815, 20.0, out var dist);

        score.Should().Be(0.0);
        dist.Should().BeNull();
    }

    [Fact]
    public void Proximity_NoDeliveryLocation_Returns50Neutral()
    {
        var score = CourierScoring.ComputeProximityScore(
            36.8065, 10.1815, null, null, 20.0, out var dist);

        score.Should().Be(50.0);
        dist.Should().BeNull();
    }

    // ── Performance ──────────────────────────────────────────────────────────

    [Fact]
    public void Performance_NewCourier_Returns50Neutral()
        => CourierScoring.ComputePerformanceScore(0, 0, null)
            .Should().Be(50.0);

    [Fact]
    public void Performance_PerfectRatingFullCompletion_Returns100()
        => CourierScoring.ComputePerformanceScore(10, 10, 5.0)
            .Should().BeApproximately(100.0, 0.1);

    [Fact]
    public void Performance_AverageRatingHalfCompletion_ReturnsMidScore()
        => CourierScoring.ComputePerformanceScore(10, 5, 2.5)
            .Should().BeApproximately(50.0, 0.1);

    // ── Haversine ────────────────────────────────────────────────────────────

    [Fact]
    public void Haversine_TunisToAriana_ApproximatelyCorrect()
    {
        var dist = CourierScoring.Haversine(
            36.8065, 10.1815,
            36.8625, 10.1956);

        dist.Should().BeInRange(5.0, 10.0);
    }

    // ── Weight validation ────────────────────────────────────────────────────

    [Fact]
    public void Weights_NormalPriority_SumToOne()
    {
        var sum = 0.40 + 0.35 + 0.25;
        sum.Should().BeApproximately(1.0, 0.001);
    }

    [Fact]
    public void Weights_UrgentPriority_SumToOne()
    {
        var sum = 0.60 + 0.25 + 0.15;
        sum.Should().BeApproximately(1.0, 0.001);
    }
}