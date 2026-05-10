using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateRecommendationPolicy;

public sealed record UpdateRecommendationPolicyCommand(
    Guid ChangedBy,
    int MaxActiveAssignments,
    double MaxScoringDistanceKm,
    double NormalAvailabilityWeight,
    double NormalProximityWeight,
    double NormalPerformanceWeight,
    double UrgentAvailabilityWeight,
    double UrgentProximityWeight,
    double UrgentPerformanceWeight) : IRequest<Unit>;