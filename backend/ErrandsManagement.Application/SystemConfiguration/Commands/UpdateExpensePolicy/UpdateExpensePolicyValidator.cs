using FluentValidation;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateExpensePolicy;

public sealed class UpdateExpensePolicyValidator : AbstractValidator<UpdateExpensePolicyCommand>
{
    public UpdateExpensePolicyValidator()
    {
        RuleFor(x => x.OverrunFlagThresholdPercent).InclusiveBetween(0, 100);
        RuleForEach(x => x.CategoryBudgetCaps.Values).GreaterThanOrEqualTo(0);
    }
}