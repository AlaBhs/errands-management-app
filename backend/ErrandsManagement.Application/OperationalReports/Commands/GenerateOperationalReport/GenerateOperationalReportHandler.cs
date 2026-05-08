using System.Text;
using System.Text.Json;
using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.OperationalReports.DTOs;
using ErrandsManagement.Domain.Entities;
using MediatR;

namespace ErrandsManagement.Application.OperationalReports.Commands.GenerateOperationalReport;

public sealed class GenerateOperationalReportHandler
    : IRequestHandler<GenerateOperationalReportCommand, OperationalReportDto>
{
    private readonly IOperationalReportRepository _reportRepository;
    private readonly IAnalyticsRepository _analyticsRepository;
    private readonly IOperationalAiService _aiService;

    public GenerateOperationalReportHandler(
        IOperationalReportRepository reportRepository,
        IAnalyticsRepository analyticsRepository,
        IOperationalAiService aiService)
    {
        _reportRepository = reportRepository;
        _analyticsRepository = analyticsRepository;
        _aiService = aiService;
    }

    public async Task<OperationalReportDto> Handle(
        GenerateOperationalReportCommand request,
        CancellationToken cancellationToken)
    {
        var periodFrom = request.From ?? DateTime.UtcNow.AddDays(-30);
        var periodTo = request.To ?? DateTime.UtcNow;

        // Idempotency: return existing report if generated in last 5 minutes
        var recent = await _reportRepository.GetMostRecentAsync(cancellationToken);
        if (recent is not null && recent.GeneratedAt >= DateTime.UtcNow.AddMinutes(-5))
            return MapToDto(recent);

        // Fetch pre-aggregated metrics
        var summary = await _analyticsRepository.GetSummaryAsync(periodFrom, periodTo, cancellationToken);
        var courierPerformance = await _analyticsRepository.GetCourierPerformanceAsync(periodFrom, periodTo, cancellationToken);

        // Build metrics snapshot (JSON for storage)
        var metricsObject = new { Summary = summary, CourierPerformance = courierPerformance };
        var metricsJson = JsonSerializer.Serialize(metricsObject);

        // Build plain-text summary for the LLM
        var summaryText = BuildSummaryText(periodFrom, periodTo, summary, courierPerformance);

        // Call AI service — never let it crash the report creation
        string? aiAnalysis = null;
        var aiUnavailable = false;
        try
        {
            aiAnalysis = await _aiService.AnalyzeAsync(summaryText, cancellationToken);
            if (aiAnalysis is null)
                aiUnavailable = true;
        }
        catch
        {
            aiUnavailable = true;
        }

        var report = new OperationalReport(
            generatedAt: DateTime.UtcNow,
            periodFrom: periodFrom,
            periodTo: periodTo,
            metricsSnapshot: metricsJson,
            aiAnalysis: aiAnalysis,
            aiUnavailable: aiUnavailable,
            generatedByUserId: request.RequestedByUserId);

        await _reportRepository.AddAsync(report, cancellationToken);
        await _reportRepository.SaveChangesAsync(cancellationToken);

        return MapToDto(report);
    }

    private static string BuildSummaryText(
        DateTime periodFrom,
        DateTime periodTo,
        AnalyticsSummaryDto summary,
        IReadOnlyList<CourierPerformanceDto> couriers)
    {
        var sb = new StringBuilder();
        sb.AppendLine("OPERATIONAL METRICS SUMMARY");
        sb.AppendLine($"Period: {periodFrom:yyyy-MM-dd} to {periodTo:yyyy-MM-dd}");
        sb.AppendLine();
        sb.AppendLine("REQUESTS");
        sb.AppendLine($"- Total: {summary.TotalRequests}");
        sb.AppendLine("- By status:");
        foreach (var kv in summary.ByStatus)
            sb.AppendLine($"  {kv.Key}: {kv.Value}");
        sb.AppendLine("- By category:");
        foreach (var kv in summary.ByCategory)
            sb.AppendLine($"  {kv.Key}: {kv.Value}");
        sb.AppendLine($"- Avg lifecycle (min): {summary.AvgLifecycleMinutes?.ToString("F1") ?? "N/A"}");
        sb.AppendLine($"- Avg execution (min): {summary.AvgExecutionMinutes?.ToString("F1") ?? "N/A"}");
        sb.AppendLine($"- Deadline compliance rate: {(summary.DeadlineComplianceRate.HasValue ? summary.DeadlineComplianceRate.Value.ToString("F1") + "%" : "N/A")}");
        sb.AppendLine($"- Avg survey rating: {summary.AvgSurveyRating?.ToString("F2") ?? "N/A"}");
        sb.AppendLine();
        sb.AppendLine("COSTS");
        sb.AppendLine($"- Total estimated: {summary.TotalEstimatedCost:F2}");
        sb.AppendLine($"- Total actual: {summary.TotalActualCost:F2}");
        sb.AppendLine($"- Budget variance: {summary.BudgetVariance?.ToString("F2") ?? "N/A"}");
        sb.AppendLine();
        sb.AppendLine("COURIER PERFORMANCE (top 5 by assignments)");
        foreach (var c in couriers.OrderByDescending(c => c.TotalAssignments).Take(5))
        {
            var onTime = c.OnTimeRate.HasValue ? c.OnTimeRate.Value.ToString("F1") + "%" : "N/A";
            var rating = c.AvgRating.HasValue ? c.AvgRating.Value.ToString("F2") : "N/A";
            sb.AppendLine($"- {c.CourierName}: {c.Completed}/{c.TotalAssignments} completed, on-time {onTime}, avg rating {rating}");
        }

        return sb.ToString();
    }

    private static OperationalReportDto MapToDto(OperationalReport report) =>
        new(
            report.Id,
            report.GeneratedAt,
            report.PeriodFrom,
            report.PeriodTo,
            report.MetricsSnapshot,
            report.AiAnalysis,
            report.AiUnavailable,
            report.GeneratedByUserId);
}
