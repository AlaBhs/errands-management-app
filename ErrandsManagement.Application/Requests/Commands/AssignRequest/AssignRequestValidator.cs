using FluentValidation;

namespace ErrandsManagement.Application.Requests.Commands.AssignRequest;



public sealed class AssignRequestValidator
    : AbstractValidator<AssignRequestCommand>
{
    public AssignRequestValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty();

        RuleFor(x => x.CourierId)
            .NotEmpty();
    }
}