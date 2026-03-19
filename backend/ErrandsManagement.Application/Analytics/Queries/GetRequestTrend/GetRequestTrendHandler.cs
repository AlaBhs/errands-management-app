using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetRequestTrend
{
    public sealed class GetRequestTrendHandler
        : IRequestHandler<GetRequestTrendQuery, IReadOnlyList<TrendPointDto>>
    {
        private readonly IAnalyticsRepository _analyticsRepository;

        public GetRequestTrendHandler(IAnalyticsRepository analyticsRepository)
        {
            _analyticsRepository = analyticsRepository;
        }

        public Task<IReadOnlyList<TrendPointDto>> Handle(
            GetRequestTrendQuery request,
            CancellationToken cancellationToken)
            => _analyticsRepository.GetTrendAsync(cancellationToken);
    }
}
