using ErrandsManagement.Application.Analytics.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetCostBreakdown
{
    public sealed record GetCostBreakdownQuery : IRequest<IReadOnlyList<CostBreakdownDto>>;
}
