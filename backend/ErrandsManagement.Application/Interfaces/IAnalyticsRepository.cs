using ErrandsManagement.Application.Analytics.DTOs;

namespace ErrandsManagement.Application.Interfaces
{
    public interface IAnalyticsRepository
    {
        Task<AnalyticsSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<TrendPointDto>> GetTrendAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<CostBreakdownDto>> GetCostBreakdownAsync(CancellationToken cancellationToken = default);
    }
}
