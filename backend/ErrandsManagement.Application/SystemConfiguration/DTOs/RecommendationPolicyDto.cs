namespace ErrandsManagement.Application.SystemConfiguration.DTOs;


public sealed record RecommendationPolicyDto(
    int MaxActiveAssignments,
    double MaxScoringDistanceKm,
    PriorityWeightsDto NormalPriorityWeights,
    PriorityWeightsDto UrgentPriorityWeights);
