

namespace ErrandsManagement.Application.Interfaces
{
    public interface IOperationalAiService
    {
        Task<string?> AnalyzeAsync(string metricsSummaryText, CancellationToken ct = default);
    }
}
