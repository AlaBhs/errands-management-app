

namespace ErrandsManagement.Application.Analytics.DTOs
{
    public sealed record AnalyticsSummaryDto(
        int TotalRequests,
        Dictionary<string, int> ByStatus,
        Dictionary<string, int> ByCategory,
        double? AvgLifecycleMinutes,
        double? AvgExecutionMinutes,
        double? AvgQueueWaitMinutes,
        double? AvgPickupDelayMinutes,
        double? AvgSurveyRating,
        double? DeadlineComplianceRate,
        decimal TotalEstimatedCost,
        decimal TotalActualCost
    );
}
