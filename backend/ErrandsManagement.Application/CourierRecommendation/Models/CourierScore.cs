namespace ErrandsManagement.Application.CourierRecommendation.Models;

/// <summary>
/// Internal scoring model — rich data used by the engine.
/// Mapped to CourierScoreDto before returning to the handler.
/// </summary>
public sealed class CourierScore
{
    public Guid CourierId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? City { get; init; }
    public int ActiveAssignmentsCount { get; init; }
    public double AverageRating { get; init; }
    public double CompletionRate { get; init; }
    public double? DistanceKm { get; init; }
    public double TotalScore { get; init; }
    public double AvailabilityScore { get; init; }
    public double ProximityScore { get; init; }
    public double PerformanceScore { get; init; }
}