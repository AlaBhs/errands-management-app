

namespace ErrandsManagement.Application.Analytics.DTOs
{
    public sealed record CourierPerformanceDto(
        Guid CourierId,
        string CourierName,
        int TotalAssignments,
        int Completed,
        int Cancelled,
        double? AvgExecutionMinutes,
        double? AvgRating,
        double? OnTimeRate
    );
}
