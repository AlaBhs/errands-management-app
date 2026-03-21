using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetCourierPerformance;

public sealed class GetCourierPerformanceHandler
    : IRequestHandler<GetCourierPerformanceQuery, IReadOnlyList<CourierPerformanceDto>>
{
    private readonly IAnalyticsRepository _analyticsRepository;

    public GetCourierPerformanceHandler(IAnalyticsRepository analyticsRepository)
    {
        _analyticsRepository = analyticsRepository;
    }

    public Task<IReadOnlyList<CourierPerformanceDto>> Handle(
        GetCourierPerformanceQuery request,
        CancellationToken cancellationToken)
        => _analyticsRepository.GetCourierPerformanceAsync(request.From, request.To, cancellationToken);
}