using FluentValidation;

namespace ErrandsManagement.Application.Requests.Commands.AddExpenseRecord
{
    public sealed class AddExpenseRecordValidator : AbstractValidator<AddExpenseRecordCommand>
    {
        public AddExpenseRecordValidator()
        {
            RuleFor(x => x.RequestId).NotEmpty();
            RuleFor(x => x.Amount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.CreatedBy).NotEmpty();
            RuleFor(x => x.Category).IsInEnum();
        }
    }
}
