using FluentValidation;

namespace ErrandsManagement.Application.Requests.Commands.CancelRequest;


public sealed class CancelRequestValidator
    : AbstractValidator<CancelRequestCommand>
{
    public CancelRequestValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty();

        RuleFor(x => x.Reason)
            .MaximumLength(500)
            .When(x => x.Reason != null);
    }
}