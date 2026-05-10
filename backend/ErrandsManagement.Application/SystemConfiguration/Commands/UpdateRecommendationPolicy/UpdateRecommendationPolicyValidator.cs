using FluentValidation;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateRecommendationPolicy;

public sealed class UpdateRecommendationPolicyValidator
    : AbstractValidator<UpdateRecommendationPolicyCommand>
{
    public UpdateRecommendationPolicyValidator()
    {
        RuleFor(x => x.MaxActiveAssignments).GreaterThan(0);
        RuleFor(x => x.MaxScoringDistanceKm).GreaterThan(0);

        RuleFor(x => x)
            .Must(x =>
            {
                var sum = x.NormalAvailabilityWeight + x.NormalProximityWeight + x.NormalPerformanceWeight;
                return Math.Abs(sum - 1.0) <= 0.001;
            })
            .WithMessage("Normal priority weights must sum to 1.0.");

        RuleFor(x => x)
            .Must(x =>
            {
                var sum = x.UrgentAvailabilityWeight + x.UrgentProximityWeight + x.UrgentPerformanceWeight;
                return Math.Abs(sum - 1.0) <= 0.001;
            })
            .WithMessage("Urgent priority weights must sum to 1.0.");

        RuleFor(x => x.NormalAvailabilityWeight).InclusiveBetween(0, 1);
        RuleFor(x => x.NormalProximityWeight).InclusiveBetween(0, 1);
        RuleFor(x => x.NormalPerformanceWeight).InclusiveBetween(0, 1);
        RuleFor(x => x.UrgentAvailabilityWeight).InclusiveBetween(0, 1);
        RuleFor(x => x.UrgentProximityWeight).InclusiveBetween(0, 1);
        RuleFor(x => x.UrgentPerformanceWeight).InclusiveBetween(0, 1);
    }
}