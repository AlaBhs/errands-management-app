using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetAnalyticsSummary
{
    public sealed class GetAnalyticsSummaryHandler
    : IRequestHandler<GetAnalyticsSummaryQuery, AnalyticsSummaryDto>
    {
        private readonly IAnalyticsRepository _analyticsRepository;

        public GetAnalyticsSummaryHandler(IAnalyticsRepository analyticsRepository)
        {
            _analyticsRepository = analyticsRepository;
        }

        public Task<AnalyticsSummaryDto> Handle(
            GetAnalyticsSummaryQuery request,
            CancellationToken cancellationToken)
            => _analyticsRepository.GetSummaryAsync(cancellationToken);
    }
}
