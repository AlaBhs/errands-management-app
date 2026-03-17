

namespace ErrandsManagement.Application.Analytics.DTOs
{
    public sealed record CostBreakdownDto(
        string Category,
        decimal EstimatedCost,
        decimal ActualCost
    );
}
