using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetMyCourierPerformance
{
    public sealed class GetMyCourierPerformanceHandler
    : IRequestHandler<GetMyCourierPerformanceQuery, CourierPerformanceDto>
    {
        private readonly IAnalyticsRepository _analyticsRepository;
        private readonly IUserRepository _userRepository;

        public GetMyCourierPerformanceHandler(
            IAnalyticsRepository analyticsRepository,
            IUserRepository userRepository)
        {
            _analyticsRepository = analyticsRepository;
            _userRepository = userRepository;
        }

        public async Task<CourierPerformanceDto> Handle(
            GetMyCourierPerformanceQuery request,
            CancellationToken cancellationToken)
        {
            var from = DateTime.UtcNow.AddDays(-request.Days);
            var to = DateTime.UtcNow;

            // reuse existing logic
            var all = await _analyticsRepository.GetCourierPerformanceAsync(
                from, to, cancellationToken);

            var mine = all.FirstOrDefault(x => x.CourierId == request.CourierId);

            if (mine != null)
                return mine;

            // fallback (important for empty datasets)
            var user = await _userRepository.FindByIdAsync(request.CourierId);

            return new CourierPerformanceDto(
                CourierId: request.CourierId,
                CourierName: user?.FullName ?? "Unknown",
                TotalAssignments: 0,
                Completed: 0,
                Cancelled: 0,
                AvgExecutionMinutes: null,
                AvgRating: null,
                OnTimeRate: null
            );
        }
    }
}
