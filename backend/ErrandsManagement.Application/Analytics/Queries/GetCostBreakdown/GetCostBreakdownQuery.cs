using ErrandsManagement.Application.Analytics.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetCostBreakdown
{
    public sealed record GetCostBreakdownQuery(
        DateTime? From,
        DateTime? To
    ) : IRequest<IReadOnlyList<CostBreakdownDto>>;
}
