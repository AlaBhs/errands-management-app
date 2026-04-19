using ErrandsManagement.Application.CourierRecommendation.DTOs;
using ErrandsManagement.Application.CourierRecommendation.Interfaces;
using ErrandsManagement.Application.CourierRecommendation.Models;
using ErrandsManagement.Application.CourierRecommendation.Settings;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
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

            var availScore = CourierScoring.ComputeAvailabilityScore(activeCount, _settings.MaxActiveAssignments);
            var proxScore = CourierScoring.ComputeProximityScore(
                courier.Latitude, courier.Longitude,
                request.DeliveryLatitude, request.DeliveryLongitude,
                _settings.MaxScoringDistanceKm,
                out var distanceKm);
            var perfScore = CourierScoring.ComputePerformanceScore(
                perf?.TotalAssignments ?? 0,
                perf?.Completed ?? 0,
                perf?.AvgRating);

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
}