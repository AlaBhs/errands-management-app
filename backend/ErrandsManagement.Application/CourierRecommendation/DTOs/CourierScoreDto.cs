namespace ErrandsManagement.Application.CourierRecommendation.DTOs;

public sealed record CourierScoreDto(
    Guid CourierId,
    string FullName,
    string Email,
    string? City,
    int ActiveAssignmentsCount,
    double AverageRating,
    double CompletionRate,
    double? DistanceKm,
    double TotalScore,
    ScoreBreakdownDto ScoreBreakdown);

public sealed record ScoreBreakdownDto(
    double AvailabilityScore,
    double ProximityScore,
    double PerformanceScore);