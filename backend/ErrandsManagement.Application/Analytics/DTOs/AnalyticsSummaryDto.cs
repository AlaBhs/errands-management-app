

namespace ErrandsManagement.Application.Analytics.DTOs
{
    public sealed record AnalyticsSummaryDto(
        int TotalRequests,
        Dictionary<string, int> ByStatus,
        Dictionary<string, int> ByCategory,
        double? AvgLifecycleMinutes,
        double? AvgExecutionMinutes,
        double? AvgSurveyRating,
        decimal TotalEstimatedCost,
        decimal TotalActualCost
    );
}
