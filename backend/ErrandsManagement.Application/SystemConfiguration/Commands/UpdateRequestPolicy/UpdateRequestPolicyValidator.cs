using FluentValidation;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateRequestPolicy;

public sealed class UpdateRequestPolicyValidator : AbstractValidator<UpdateRequestPolicyCommand>
{
    public UpdateRequestPolicyValidator()
    {
        RuleFor(x => x.EnabledCategories).NotEmpty().WithMessage("At least one category must be enabled.");
        RuleFor(x => x.MinDeadlineAdvanceHours).GreaterThan(0);
    }
}