using ErrandsManagement.Application.Analytics.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetCourierPerformance
{
    public sealed record GetCourierPerformanceQuery(
        DateTime? From,
        DateTime? To
    ) : IRequest<IReadOnlyList<CourierPerformanceDto>>;
}
