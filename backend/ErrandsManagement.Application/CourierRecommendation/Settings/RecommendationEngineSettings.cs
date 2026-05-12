using Microsoft.Extensions.Options;

namespace ErrandsManagement.Application.CourierRecommendation.Settings;

public sealed class RecommendationEngineSettings
{
    public const string SectionName = "RecommendationEngine";

    public int MaxActiveAssignments { get; init; } = 3;
    public double MaxScoringDistanceKm { get; init; } = 20.0;
    public PriorityWeights NormalPriority { get; init; } = new();
    public PriorityWeights UrgentPriority { get; init; } = new();

    public PriorityWeights GetWeights(Domain.Enums.PriorityLevel priority) => priority switch
    {
        Domain.Enums.PriorityLevel.High or
        Domain.Enums.PriorityLevel.Urgent => UrgentPriority,
        _ => NormalPriority
    };
}

public sealed class PriorityWeights
{
    public double AvailabilityWeight { get; init; } = 0.40;
    public double ProximityWeight { get; init; } = 0.35;
    public double PerformanceWeight { get; init; } = 0.25;

    public void Validate()
    {
        var sum = AvailabilityWeight + ProximityWeight + PerformanceWeight;
        if (Math.Abs(sum - 1.0) > 0.001)
            throw new InvalidOperationException(
                $"Weights must sum to 1.0 but sum to {sum:F3}. Check RecommendationEngine config.");
    }
}