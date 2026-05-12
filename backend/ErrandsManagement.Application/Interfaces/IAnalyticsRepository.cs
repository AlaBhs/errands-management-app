using ErrandsManagement.Application.Analytics.DTOs;

namespace ErrandsManagement.Application.Interfaces
{
    public interface IAnalyticsRepository
    {
        Task<AnalyticsSummaryDto> GetSummaryAsync(
            DateTime? from, DateTime? to,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<TrendPointDto>> GetTrendAsync(
            DateTime? from, DateTime? to,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<CostBreakdownDto>> GetCostBreakdownAsync(
            DateTime? from, DateTime? to,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<CourierPerformanceDto>> GetCourierPerformanceAsync(
            DateTime? from, DateTime? to,
            CancellationToken cancellationToken = default);
    }
}
