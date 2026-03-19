using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories
{
    public sealed class AnalyticsRepository : IAnalyticsRepository
    {
        private readonly AppDbContext _db;
        private readonly IUserRepository _userRepository;

        public AnalyticsRepository(AppDbContext db, IUserRepository userRepository)
        {
            _db = db;
            _userRepository = userRepository;
        }

        public async Task<AnalyticsSummaryDto> GetSummaryAsync(
            CancellationToken cancellationToken = default)
        {
            // --- status counts ---
            var statusCounts = await _db.Requests
                .GroupBy(r => r.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            // --- category counts ---
            var categoryCounts = await _db.Requests
                .GroupBy(r => r.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            // --- totals: request count + estimated cost ---
            var totals = await _db.Requests
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    TotalEstimated = g.Sum(r => r.EstimatedCost ?? 0m),
                })
                .FirstOrDefaultAsync(cancellationToken);

            // --- actual cost: sum across all assignments ---
            var totalActualCost = await _db.Requests
                .SelectMany(r => r.Assignments)
                .SumAsync(a => a.ActualCost ?? 0m, cancellationToken);

            // --- avg lifecycle: CreatedAt (on Request) → CompletedAt (on Assignment) ---
            // This is the end-to-end SLA: how long from submission to done.
            var lifecyclePairs = await _db.Requests
                .Where(r => r.Status == RequestStatus.Completed)
                .Select(r => new
                {
                    CreatedAt = r.CreatedAt,
                    CompletedAt = r.Assignments
                                   .Where(a => a.CompletedAt != null)
                                   .OrderByDescending(a => a.CompletedAt)
                                   .Select(a => a.CompletedAt!.Value)
                                   .FirstOrDefault(),
                })
                .ToListAsync(cancellationToken);

            double? avgLifecycleMinutes = lifecyclePairs.Count > 0
                ? lifecyclePairs
                    .Where(p => p.CompletedAt != default)
                    .Select(p => (p.CompletedAt - p.CreatedAt).TotalMinutes)
                    .DefaultIfEmpty()
                    .Average() is double avg && avg > 0 ? avg : null
                : null;

            // --- avg execution: StartedAt → CompletedAt (courier speed metric) ---
            var executionPairs = await _db.Requests
                .SelectMany(r => r.Assignments)
                .Where(a => a.StartedAt != null && a.CompletedAt != null)
                .Select(a => new
                {
                    StartedAt = a.StartedAt!.Value,
                    CompletedAt = a.CompletedAt!.Value,
                })
                .ToListAsync(cancellationToken);

            double? avgExecutionMinutes = executionPairs.Count > 0
                ? executionPairs.Average(p => (p.CompletedAt - p.StartedAt).TotalMinutes)
                : null;

            // --- avg survey rating ---
            var avgSurveyRating = await _db.Requests
                .Where(r => r.Survey != null)
                .AverageAsync(r => (double?)r.Survey!.Rating, cancellationToken);

            return new AnalyticsSummaryDto(
                TotalRequests: totals?.Total ?? 0,
                ByStatus: statusCounts.ToDictionary(x => x.Status.ToString(), x => x.Count),
                ByCategory: categoryCounts.ToDictionary(x => x.Category.ToString(), x => x.Count),
                AvgLifecycleMinutes: avgLifecycleMinutes,
                AvgExecutionMinutes: avgExecutionMinutes,
                AvgSurveyRating: avgSurveyRating,
                TotalEstimatedCost: totals?.TotalEstimated ?? 0m,
                TotalActualCost: totalActualCost
            );
        }

        public async Task<IReadOnlyList<TrendPointDto>> GetTrendAsync(
            CancellationToken cancellationToken = default)
        {
            var cutoff = DateTime.UtcNow.AddMonths(-5); // current month + 5 previous = 6 total
            var cutoffFloor = new DateTime(cutoff.Year, cutoff.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var raw = await _db.Requests
                .Where(r => r.CreatedAt >= cutoffFloor)
                .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Count = g.Count(),
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync(cancellationToken);

            // Ensure every month in the window is represented, even if count is 0
            var result = new List<TrendPointDto>();
            for (var i = 0; i < 6; i++)
            {
                var point = cutoffFloor.AddMonths(i);
                var match = raw.FirstOrDefault(
                    x => x.Year == point.Year && x.Month == point.Month);

                result.Add(new TrendPointDto(
                    Year: point.Year,
                    Month: point.Month,
                    Count: match?.Count ?? 0));
            }

            return result;
        }

        public async Task<IReadOnlyList<CostBreakdownDto>> GetCostBreakdownAsync(
    CancellationToken cancellationToken = default)
        {
            // Estimated cost: grouped directly on Requests
            var estimated = await _db.Requests
                .GroupBy(r => r.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    EstimatedCost = g.Sum(r => r.EstimatedCost ?? 0m),
                })
                .ToListAsync(cancellationToken);

            var actualPairs = await _db.Requests
                .Where(r => r.Assignments.Any())
                .Select(r => new
                {
                    Category = r.Category,
                    ActualCost = r.Assignments
                                  .Sum(a => a.ActualCost ?? 0m),
                })
                .ToListAsync(cancellationToken);

            var actualByCategory = actualPairs
                .GroupBy(x => x.Category)
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(x => x.ActualCost));

            var result = estimated
                .Select(e => new CostBreakdownDto(
                    Category: e.Category.ToString(),
                    EstimatedCost: e.EstimatedCost,
                    ActualCost: actualByCategory.GetValueOrDefault(e.Category, 0m)))
                .OrderBy(x => x.Category)
                .ToList();

            return result;
        }
        public async Task<IReadOnlyList<CourierPerformanceDto>> GetCourierPerformanceAsync(
    CancellationToken cancellationToken = default)
        {
            // ── Step 1: aggregate purely on the Requests/Assignments tables ──────────
            // Group by CourierId — no join to AspNetUsers inside SQL.

            // Per-courier assignment counts
            var assignmentCounts = await _db.Requests
                .SelectMany(r => r.Assignments)
                .GroupBy(a => a.CourierId)
                .Select(g => new
                {
                    CourierId = g.Key,
                    TotalAssignments = g.Count(),
                    // An assignment is completed when CompletedAt is set
                    Completed = g.Count(a => a.CompletedAt != null),
                })
                .ToListAsync(cancellationToken);

            // Per-courier avg execution time (StartedAt → CompletedAt), in memory
            // because computed props (IsCompleted) can't be used in SQL
            var executionPairs = await _db.Requests
                .SelectMany(r => r.Assignments)
                .Where(a => a.StartedAt != null && a.CompletedAt != null)
                .Select(a => new
                {
                    CourierId = a.CourierId,
                    StartedAt = a.StartedAt!.Value,
                    CompletedAt = a.CompletedAt!.Value,
                })
                .ToListAsync(cancellationToken);

            var avgExecutionByCourier = executionPairs
                .GroupBy(x => x.CourierId)
                .ToDictionary(
                    g => g.Key,
                    g => (double?)g.Average(
                        x => (x.CompletedAt - x.StartedAt).TotalMinutes));

            // Per-courier avg survey rating
            // Survey lives on Request — join Request + its Survey + its last Assignment
            var ratingPairs = await _db.Requests
                .Where(r => r.Survey != null)
                .Select(r => new
                {
                    Rating = r.Survey!.Rating,
                    CourierId = r.Assignments
                                 .Where(a => a.CompletedAt != null)
                                 .OrderByDescending(a => a.CompletedAt)
                                 .Select(a => a.CourierId)
                                 .FirstOrDefault(),
                })
                .ToListAsync(cancellationToken);

            var avgRatingByCourier = ratingPairs
                .Where(x => x.CourierId != Guid.Empty)
                .GroupBy(x => x.CourierId)
                .ToDictionary(
                    g => g.Key,
                    g => (double?)g.Average(x => x.Rating));

            // Per-courier on-time rate:
            // Only completed requests that had a deadline — exclude nulls entirely
            var deadlineRows = await _db.Requests
                .Where(r => r.Status == RequestStatus.Completed && r.Deadline.HasValue)
                .Select(r => new
                {
                    Deadline = r.Deadline!.Value,
                    CompletedAt = r.Assignments
                                   .Where(a => a.CompletedAt != null)
                                   .OrderByDescending(a => a.CompletedAt)
                                   .Select(a => a.CompletedAt!.Value)
                                   .FirstOrDefault(),
                    CourierId = r.Assignments
                                   .Where(a => a.CompletedAt != null)
                                   .OrderByDescending(a => a.CompletedAt)
                                   .Select(a => a.CourierId)
                                   .FirstOrDefault(),
                })
                .ToListAsync(cancellationToken);

            var onTimeRateByCourier = deadlineRows
                .Where(x => x.CourierId != Guid.Empty && x.CompletedAt != default)
                .GroupBy(x => x.CourierId)
                .ToDictionary(
                    g => g.Key,
                    g =>
                    {
                        var total = g.Count();
                        var onTime = g.Count(x => x.CompletedAt <= x.Deadline);
                        return total > 0
                            ? (double?)Math.Round((double)onTime / total * 100, 1)
                            : null;
                    });

            // Cancelled: a courier's assignment is cancelled when the Request is
            // Cancelled and they had an active assignment on it
            var cancelledByCourier = await _db.Requests
                .Where(r => r.Status == RequestStatus.Cancelled)
                .SelectMany(r => r.Assignments)
                .GroupBy(a => a.CourierId)
                .Select(g => new { CourierId = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            var cancelledDict = cancelledByCourier
                .ToDictionary(x => x.CourierId, x => x.Count);

            // ── Step 2: resolve courier names via IUserRepository ────────────────────
            // Collect all distinct courier IDs across all result sets
            var allCourierIds = assignmentCounts
                .Select(x => x.CourierId)
                .Distinct()
                .ToList();

            var nameById = new Dictionary<Guid, string>();
            foreach (var courierId in allCourierIds)
            {
                var user = await _userRepository.FindByIdAsync(courierId);
                nameById[courierId] = user?.FullName ?? "Unknown";
            }

            // ── Step 3: merge into DTOs ───────────────────────────────────────────────
            var result = assignmentCounts
                .Select(c => new CourierPerformanceDto(
                    CourierId: c.CourierId,
                    CourierName: nameById.GetValueOrDefault(c.CourierId, "Unknown"),
                    TotalAssignments: c.TotalAssignments,
                    Completed: c.Completed,
                    Cancelled: cancelledDict.GetValueOrDefault(c.CourierId, 0),
                    AvgExecutionMinutes: avgExecutionByCourier.GetValueOrDefault(c.CourierId),
                    AvgRating: avgRatingByCourier.GetValueOrDefault(c.CourierId),
                    OnTimeRate: onTimeRateByCourier.GetValueOrDefault(c.CourierId)))
                .OrderByDescending(x => x.Completed)
                .ToList();

            return result;
        }
    }
}
