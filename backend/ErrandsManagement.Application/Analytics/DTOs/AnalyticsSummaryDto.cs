

namespace ErrandsManagement.Application.Analytics.DTOs
{
    public sealed record AnalyticsSummaryDto(
        int TotalRequests,
        Dictionary<string, int> ByStatus,
        Dictionary<string, int> ByCategory,
        double? AvgCompletionTimeMinutes,
        double? AvgSurveyRating,
        decimal TotalEstimatedCost,
        decimal TotalActualCost
    );
}
