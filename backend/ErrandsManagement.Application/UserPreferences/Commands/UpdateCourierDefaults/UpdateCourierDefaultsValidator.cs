using FluentValidation;

namespace ErrandsManagement.Application.UserPreferences.Commands.UpdateCourierDefaults;

public sealed class UpdateCourierDefaultsValidator : AbstractValidator<UpdateCourierDefaultsCommand>
{
    public UpdateCourierDefaultsValidator()
    {
        When(x => x.MaxConcurrentAssignments.HasValue, () =>
            RuleFor(x => x.MaxConcurrentAssignments!.Value).GreaterThan(0));

        When(x => x.AvailableFromHour.HasValue, () =>
            RuleFor(x => x.AvailableFromHour!.Value).InclusiveBetween(0, 23));

        When(x => x.AvailableToHour.HasValue, () =>
            RuleFor(x => x.AvailableToHour!.Value).InclusiveBetween(0, 23));

        When(x => x.AvailableFromHour.HasValue && x.AvailableToHour.HasValue, () =>
            RuleFor(x => x)
                .Must(x => x.AvailableFromHour!.Value < x.AvailableToHour!.Value)
                .WithMessage("AvailableFromHour must be less than AvailableToHour."));
    }
}