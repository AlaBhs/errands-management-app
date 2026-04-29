using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories;

public sealed class AnalyticsRepository : IAnalyticsRepository
{
    private readonly AppDbContext _db;
    private readonly IUserRepository _userRepository;

    public AnalyticsRepository(AppDbContext db, IUserRepository userRepository)
    {
        _db = db;
        _userRepository = userRepository;
    }

    // ── shared filter helper ───────────────────────────────────────────────────
    // All endpoints anchor on Request.CreatedAt for consistency.
    private IQueryable<Request> Filtered(DateTime? from, DateTime? to)
    {
        var q = _db.Requests.AsQueryable();
        if (from.HasValue) q = q.Where(r => r.CreatedAt >= from.Value);
        if (to.HasValue) q = q.Where(r => r.CreatedAt <= to.Value);
        return q;
    }

    // ── GetSummaryAsync ────────────────────────────────────────────────────────
    public async Task<AnalyticsSummaryDto> GetSummaryAsync(
        DateTime? from, DateTime? to,
        CancellationToken cancellationToken = default)
    {
        var base_ = Filtered(from, to);

        var statusCounts = await base_
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var categoryCounts = await base_
            .GroupBy(r => r.Category)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var totals = await base_
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total = g.Count(),
                TotalEstimated = g.Sum(r => r.EstimatedCost ?? 0m),
            })
            .FirstOrDefaultAsync(cancellationToken);

        var totalActualCost = await base_
            .SelectMany(r => r.ExpenseRecords)
            .SumAsync(e => e.Amount, cancellationToken);

        // avg lifecycle
        var lifecyclePairs = await base_
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
                .Where(p => p.CompletedAt != default && p.CompletedAt > p.CreatedAt)
                .Select(p => (p.CompletedAt - p.CreatedAt).TotalMinutes)
                .DefaultIfEmpty()
                .Average() is double lAvg && lAvg > 0 ? lAvg : null
            : null;

        // avg execution
        var executionPairs = await base_
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

        // avg queue wait
        var queueWaitPairs = await base_
            .Where(r => r.AuditLogs.Any(l => l.EventType == "Assigned"))
            .Select(r => new
            {
                CreatedAt = r.AuditLogs
                              .Where(l => l.EventType == "Created")
                              .OrderBy(l => l.OccurredAt)
                              .Select(l => l.OccurredAt)
                              .FirstOrDefault(),
                AssignedAt = r.AuditLogs
                              .Where(l => l.EventType == "Assigned")
                              .OrderBy(l => l.OccurredAt)
                              .Select(l => l.OccurredAt)
                              .FirstOrDefault(),
            })
            .ToListAsync(cancellationToken);

        double? avgQueueWaitMinutes = queueWaitPairs.Count > 0
            ? queueWaitPairs
                .Where(p => p.CreatedAt != default && p.AssignedAt != default
                            && p.AssignedAt > p.CreatedAt)
                .Select(p => (p.AssignedAt - p.CreatedAt).TotalMinutes)
                .DefaultIfEmpty()
                .Average() is double qAvg && qAvg > 0 ? qAvg : null
            : null;

        // avg pickup delay
        var pickupDelayPairs = await base_
            .Where(r => r.AuditLogs.Any(l => l.EventType == "Started"))
            .Select(r => new
            {
                AssignedAt = r.AuditLogs
                              .Where(l => l.EventType == "Assigned")
                              .OrderBy(l => l.OccurredAt)
                              .Select(l => l.OccurredAt)
                              .FirstOrDefault(),
                StartedAt = r.AuditLogs
                              .Where(l => l.EventType == "Started")
                              .OrderBy(l => l.OccurredAt)
                              .Select(l => l.OccurredAt)
                              .FirstOrDefault(),
            })
            .ToListAsync(cancellationToken);

        double? avgPickupDelayMinutes = pickupDelayPairs.Count > 0
            ? pickupDelayPairs
                .Where(p => p.AssignedAt != default && p.StartedAt != default
                            && p.StartedAt > p.AssignedAt)
                .Select(p => (p.StartedAt - p.AssignedAt).TotalMinutes)
                .DefaultIfEmpty()
                .Average() is double pAvg && pAvg > 0 ? pAvg : null
            : null;

        // deadline compliance
        var deadlineRows = await base_
            .Where(r => r.Status == RequestStatus.Completed && r.Deadline.HasValue)
            .Select(r => new
            {
                Deadline = r.Deadline!.Value,
                CompletedAt = r.Assignments
                               .Where(a => a.CompletedAt != null)
                               .OrderByDescending(a => a.CompletedAt)
                               .Select(a => a.CompletedAt!.Value)
                               .FirstOrDefault(),
            })
            .ToListAsync(cancellationToken);

        double? deadlineComplianceRate = deadlineRows.Count > 0
            ? Math.Round(
                (double)deadlineRows.Count(
                    x => x.CompletedAt != default && x.CompletedAt <= x.Deadline)
                / deadlineRows.Count * 100, 1)
            : null;

        // avg survey rating
        var avgSurveyRating = await base_
            .Where(r => r.Survey != null)
            .AverageAsync(r => (double?)r.Survey!.Rating, cancellationToken);

        var totalEstimated = totals?.TotalEstimated ?? 0m;

        decimal? budgetVariance = totalEstimated > 0
            ? totalActualCost - totalEstimated
            : null;

        return new AnalyticsSummaryDto(
            TotalRequests: totals?.Total ?? 0,
            ByStatus: statusCounts.ToDictionary(
                                        x => x.Status.ToString(), x => x.Count),
            ByCategory: categoryCounts.ToDictionary(
                                        x => x.Category.ToString(), x => x.Count),
            AvgLifecycleMinutes: avgLifecycleMinutes,
            AvgExecutionMinutes: avgExecutionMinutes,
            AvgQueueWaitMinutes: avgQueueWaitMinutes,
            AvgPickupDelayMinutes: avgPickupDelayMinutes,
            AvgSurveyRating: avgSurveyRating,
            DeadlineComplianceRate: deadlineComplianceRate,
            TotalEstimatedCost: totals?.TotalEstimated ?? 0m,
            TotalActualCost: totalActualCost,
            BudgetVariance: budgetVariance
        );
    }

    // ── GetTrendAsync ──────────────────────────────────────────────────────────
    public async Task<IReadOnlyList<TrendPointDto>> GetTrendAsync(
        DateTime? from, DateTime? to,
        CancellationToken cancellationToken = default)
    {
        // Default window: last 6 months — only applied when no filter is set
        var effectiveFrom = from ?? DateTime.UtcNow.AddMonths(-5);
        var effectiveTo = to ?? DateTime.UtcNow;

        // Normalise to month boundaries so grouping is clean
        var windowStart = new DateTime(
            effectiveFrom.Year, effectiveFrom.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var windowEnd = new DateTime(
            effectiveTo.Year, effectiveTo.Month,
            DateTime.DaysInMonth(effectiveTo.Year, effectiveTo.Month),
            23, 59, 59, DateTimeKind.Utc);

        var raw = await _db.Requests
            .Where(r => r.CreatedAt >= windowStart && r.CreatedAt <= windowEnd)
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

        // Fill every month in the window — even those with zero requests
        var result = new List<TrendPointDto>();
        var cursor = windowStart;
        while (cursor <= windowEnd)
        {
            var match = raw.FirstOrDefault(
                x => x.Year == cursor.Year && x.Month == cursor.Month);

            result.Add(new TrendPointDto(
                Year: cursor.Year,
                Month: cursor.Month,
                Count: match?.Count ?? 0));

            cursor = cursor.AddMonths(1);
        }

        return result;
    }

    // ── GetCostBreakdownAsync ──────────────────────────────────────────────────
    public async Task<IReadOnlyList<CostBreakdownDto>> GetCostBreakdownAsync(
        DateTime? from, DateTime? to,
        CancellationToken cancellationToken = default)
    {
        var base_ = Filtered(from, to);

        var estimated = await base_
            .GroupBy(r => r.Category)
            .Select(g => new
            {
                Category = g.Key,
                EstimatedCost = g.Sum(r => r.EstimatedCost ?? 0m),
            })
            .ToListAsync(cancellationToken);

        var actualPairs = await base_
            .Where(r => r.ExpenseRecords.Any())
            .Select(r => new
            {
                Category = r.Category,
                ActualCost = r.ExpenseRecords.Sum(e => e.Amount),
            })
            .ToListAsync(cancellationToken);

        var actualByCategory = actualPairs
            .GroupBy(x => x.Category)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.ActualCost));

        return estimated
            .Select(e => new CostBreakdownDto(
                Category: e.Category.ToString(),
                EstimatedCost: e.EstimatedCost,
                ActualCost: actualByCategory.GetValueOrDefault(e.Category, 0m)))
            .OrderBy(x => x.Category)
            .ToList();
    }

    // ── GetCourierPerformanceAsync ─────────────────────────────────────────────
    public async Task<IReadOnlyList<CourierPerformanceDto>> GetCourierPerformanceAsync(
        DateTime? from, DateTime? to,
        CancellationToken cancellationToken = default)
    {
        var base_ = Filtered(from, to);

        var assignmentCounts = await base_
            .SelectMany(r => r.Assignments)
            .GroupBy(a => a.CourierId)
            .Select(g => new
            {
                CourierId = g.Key,
                TotalAssignments = g.Count(),
                Completed = g.Count(a => a.CompletedAt != null),
            })
            .ToListAsync(cancellationToken);

        var executionPairs = await base_
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

        var ratingPairs = await base_
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

        var deadlineRows = await base_
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

        var cancelledByCourier = await base_
            .Where(r => r.Status == RequestStatus.Cancelled)
            .SelectMany(r => r.Assignments)
            .GroupBy(a => a.CourierId)
            .Select(g => new { CourierId = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var cancelledDict = cancelledByCourier
            .ToDictionary(x => x.CourierId, x => x.Count);

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

        return assignmentCounts
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
    }
}