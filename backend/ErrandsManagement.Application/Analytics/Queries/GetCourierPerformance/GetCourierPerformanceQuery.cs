using ErrandsManagement.Application.Analytics.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetCourierPerformance
{
    public sealed record GetCourierPerformanceQuery : IRequest<IReadOnlyList<CourierPerformanceDto>>;
}
