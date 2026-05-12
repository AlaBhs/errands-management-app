using ErrandsManagement.Application.Analytics.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetMyCourierPerformance
{
    public sealed record GetMyCourierPerformanceQuery(
    Guid CourierId,
    int Days
) : IRequest<CourierPerformanceDto>;
}
