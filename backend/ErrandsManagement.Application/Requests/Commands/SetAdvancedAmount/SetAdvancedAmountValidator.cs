using FluentValidation;

namespace ErrandsManagement.Application.Requests.Commands.SetAdvancedAmount
{
    public sealed class SetAdvancedAmountValidator : AbstractValidator<SetAdvancedAmountCommand>
    {
        public SetAdvancedAmountValidator()
        {
            RuleFor(x => x.RequestId).NotEmpty();
            RuleFor(x => x.Amount).GreaterThanOrEqualTo(0);
        }
    }
}
