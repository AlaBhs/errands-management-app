using ErrandsManagement.Application.Analytics.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetRequestTrend
{
    public sealed record GetRequestTrendQuery(
    DateTime? From,
    DateTime? To
    ) : IRequest<IReadOnlyList<TrendPointDto>>;
}
