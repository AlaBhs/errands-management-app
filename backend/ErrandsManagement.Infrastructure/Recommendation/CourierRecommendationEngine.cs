using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.CourierRecommendation.DTOs;
using ErrandsManagement.Application.CourierRecommendation.Interfaces;
using ErrandsManagement.Application.CourierRecommendation.Models;
using ErrandsManagement.Application.CourierRecommendation.Settings;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ErrandsManagement.Infrastructure.Recommendation;

public sealed class CourierRecommendationEngine : ICourierRecommendationEngine
{
    private readonly AppDbContext _db;
    private readonly IAnalyticsRepository _analytics;
    private readonly RecommendationEngineSettings _settings;

    public CourierRecommendationEngine(
        AppDbContext db,
        IAnalyticsRepository analytics,
        IOptions<RecommendationEngineSettings> settings)
    {
        _db = db;
        _analytics = analytics;
        _settings = settings.Value;
    }

    public async Task<List<CourierScore>> RecommendAsync(
        RecommendationRequestDto request,
        CancellationToken ct)
    {
        // ── 1. Load all active couriers with location data ────────────────
        var courierRoleName = UserRole.Courier.ToString();

        var couriers = await (
            from user in _db.Users
            join userRole in _db.UserRoles on user.Id equals userRole.UserId
            join role in _db.Roles on userRole.RoleId equals role.Id
            where role.Name == courierRoleName && user.IsActive
            select new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.City,
                user.Latitude,
                user.Longitude
            }
        ).ToListAsync(ct);

        if (couriers.Count == 0)
            return [];

        // ── 2. Active assignment counts ───────────────────────────────────
        var courierIds = couriers.Select(c => c.Id).ToList();

        var activeCountsByCourier = await _db.Set<Domain.Entities.Request>()
            .SelectMany(r => r.Assignments)
            .Where(a => !a.IsCompleted && courierIds.Contains(a.CourierId))
            .GroupBy(a => a.CourierId)
            .Select(g => new { CourierId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CourierId, x => x.Count, ct);

        // ── 3. Performance data (reuse existing analytics logic) ──────────
        var performanceData = await _analytics
            .GetCourierPerformanceAsync(null, null, ct);

        var perfByCourier = performanceData.ToDictionary(p => p.CourierId);

        // ── 4. Weights for this request's priority ────────────────────────
        var weights = _settings.GetWeights(request.Priority);

        // ── 5. Score each courier ─────────────────────────────────────────
        var scores = couriers.Select(courier =>
        {
            var activeCount = activeCountsByCourier.GetValueOrDefault(courier.Id, 0);
            perfByCourier.TryGetValue(courier.Id, out var perf);

            var availScore = ComputeAvailabilityScore(activeCount, _settings.MaxActiveAssignments);
            var proxScore = ComputeProximityScore(
                courier.Latitude, courier.Longitude,
                request.DeliveryLatitude, request.DeliveryLongitude,
                _settings.MaxScoringDistanceKm,
                out var distanceKm);
            var perfScore = ComputePerformanceScore(perf);

            var total =
                availScore * weights.AvailabilityWeight +
                proxScore * weights.ProximityWeight +
                perfScore * weights.PerformanceWeight;

            return new CourierScore
            {
                CourierId = courier.Id,
                FullName = courier.FullName,
                Email = courier.Email ?? string.Empty,
                City = courier.City,
                ActiveAssignmentsCount = activeCount,
                AverageRating = perf?.AvgRating ?? 0,
                CompletionRate = perf is null || perf.TotalAssignments == 0
                    ? 0
                    : (double)perf.Completed / perf.TotalAssignments,
                DistanceKm = distanceKm,
                AvailabilityScore = availScore,
                ProximityScore = proxScore,
                PerformanceScore = perfScore,
                TotalScore = Math.Round(total, 2)
            };
        })
        .OrderByDescending(s => s.TotalScore)
        .Take(10)
        .ToList();

        return scores;
    }

    // ── Pure scoring helpers — no EF, fully unit-testable ─────────────────

    internal static double ComputeAvailabilityScore(int activeCount, int maxActive)
    {
        if (maxActive <= 0) return 0;
        return Math.Max(0, (1.0 - (double)activeCount / maxActive) * 100.0);
    }

    internal static double ComputeProximityScore(
        double? courierLat, double? courierLng,
        double? deliveryLat, double? deliveryLng,
        double maxDistanceKm,
        out double? distanceKm)
    {
        // No delivery coords → neutral score, no distance
        if (deliveryLat is null || deliveryLng is null)
        {
            distanceKm = null;
            return 50.0;
        }

        // Courier has no location → score 0, distance unknown
        if (courierLat is null || courierLng is null)
        {
            distanceKm = null;
            return 0.0;
        }

        distanceKm = Haversine(courierLat.Value, courierLng.Value,
                               deliveryLat.Value, deliveryLng.Value);

        return Math.Max(0, (1.0 - distanceKm.Value / maxDistanceKm) * 100.0);
    }

    internal static double ComputePerformanceScore(CourierPerformanceDto? perf)
    {
        if (perf is null || perf.TotalAssignments == 0)
            return 50.0; // new courier — neutral

        var normalizedRating = perf.AvgRating.HasValue
            ? (perf.AvgRating.Value / 5.0) * 100.0
            : 50.0;

        var completionRate = perf.TotalAssignments == 0
            ? 0.0
            : (double)perf.Completed / perf.TotalAssignments * 100.0;

        return normalizedRating * 0.5 + completionRate * 0.5;
    }

    /// <summary>Haversine formula — returns distance in km.</summary>
    internal static double Haversine(
        double lat1, double lon1,
        double lat2, double lon2)
    {
        const double R = 6371.0; // Earth radius in km
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
              * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double degrees) => degrees * Math.PI / 180.0;
}