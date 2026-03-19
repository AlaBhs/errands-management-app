using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetCostBreakdown
{
    public sealed class GetCostBreakdownHandler
        : IRequestHandler<GetCostBreakdownQuery, IReadOnlyList<CostBreakdownDto>>
    {
        private readonly IAnalyticsRepository _analyticsRepository;

        public GetCostBreakdownHandler(IAnalyticsRepository analyticsRepository)
        {
            _analyticsRepository = analyticsRepository;
        }

        public Task<IReadOnlyList<CostBreakdownDto>> Handle(
            GetCostBreakdownQuery request,
            CancellationToken cancellationToken)
            => _analyticsRepository.GetCostBreakdownAsync(cancellationToken);
    }
}
