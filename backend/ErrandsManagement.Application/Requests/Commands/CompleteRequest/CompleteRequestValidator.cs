using FluentValidation;

namespace ErrandsManagement.Application.Requests.Commands.CompleteRequest;


public sealed class CompleteRequestValidator
    : AbstractValidator<CompleteRequestCommand>
{
    public CompleteRequestValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty();

        RuleFor(x => x.ActualCost)
            .GreaterThanOrEqualTo(0)
            .When(x => x.ActualCost.HasValue);

        RuleFor(x => x.Note)
            .MaximumLength(500)
            .When(x => x.Note != null);
    }
}