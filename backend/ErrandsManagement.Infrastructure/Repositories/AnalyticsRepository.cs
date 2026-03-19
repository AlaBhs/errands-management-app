using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories
{
    public sealed class AnalyticsRepository : IAnalyticsRepository
    {
        private readonly AppDbContext _db;

        public AnalyticsRepository(AppDbContext db)
        {
            _db = db;
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

            // --- avg completion time (minutes): StartedAt → CompletedAt ---
            // Pull the nullable pairs into memory; EF can't translate
            // DateDiff on a nullable DateTime subtraction universally.
            var completionPairs = await _db.Requests
                .SelectMany(r => r.Assignments)
                .Where(a => a.StartedAt != null && a.CompletedAt != null)
                .Select(a => new
                {
                    StartedAt = a.StartedAt!.Value,
                    CompletedAt = a.CompletedAt!.Value,
                })
                .ToListAsync(cancellationToken);

            double? avgCompletionTimeMinutes = completionPairs.Count > 0
                ? completionPairs.Average(
                    p => (p.CompletedAt - p.StartedAt).TotalMinutes)
                : null;

            // --- avg survey rating ---
            var avgSurveyRating = await _db.Requests
                .Where(r => r.Survey != null)
                .AverageAsync(r => (double?)r.Survey!.Rating, cancellationToken);

            return new AnalyticsSummaryDto(
                TotalRequests: totals?.Total ?? 0,
                ByStatus: statusCounts.ToDictionary(
                                              x => x.Status.ToString(),
                                              x => x.Count),
                ByCategory: categoryCounts.ToDictionary(
                                              x => x.Category.ToString(),
                                              x => x.Count),
                AvgCompletionTimeMinutes: avgCompletionTimeMinutes,
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

        public Task<IReadOnlyList<CostBreakdownDto>> GetCostBreakdownAsync(
            CancellationToken cancellationToken = default)
            => throw new NotImplementedException();
    }
}
