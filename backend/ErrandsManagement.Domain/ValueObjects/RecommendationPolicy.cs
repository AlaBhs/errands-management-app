namespace ErrandsManagement.Domain.ValueObjects;

public sealed record RecommendationPolicy
{
    public int MaxActiveAssignments { get; init; } = 3;
    public double MaxScoringDistanceKm { get; init; } = 20.0;
    public PriorityWeights NormalPriorityWeights { get; init; } = new(0.40, 0.35, 0.25);
    public PriorityWeights UrgentPriorityWeights { get; init; } = new(0.20, 0.50, 0.30);

    public void Validate()
    {
        NormalPriorityWeights.Validate("NormalPriority");
        UrgentPriorityWeights.Validate("UrgentPriority");

        if (MaxActiveAssignments <= 0)
            throw new InvalidOperationException("MaxActiveAssignments must be greater than 0.");

        if (MaxScoringDistanceKm <= 0)
            throw new InvalidOperationException("MaxScoringDistanceKm must be greater than 0.");
    }

    public PriorityWeights GetWeights(Enums.PriorityLevel priority) => priority switch
    {
        Enums.PriorityLevel.High or
        Enums.PriorityLevel.Urgent => UrgentPriorityWeights,
        _ => NormalPriorityWeights
    };
}

public sealed record PriorityWeights(double AvailabilityWeight, double ProximityWeight, double PerformanceWeight)
{
    public PriorityWeights() : this(0.40, 0.35, 0.25) { }

    public void Validate(string section)
    {
        var sum = AvailabilityWeight + ProximityWeight + PerformanceWeight;
        if (Math.Abs(sum - 1.0) > 0.001)
            throw new InvalidOperationException(
                $"Weights in {section} must sum to 1.0 but sum to {sum:F3}.");
    }
}