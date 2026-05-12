using FluentValidation;

namespace ErrandsManagement.Application.RequestMessages.Commands;

public sealed class SendRequestMessageValidator : AbstractValidator<SendRequestMessageCommand>
{
    public SendRequestMessageValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty().WithMessage("RequestId is required.");

        RuleFor(x => x.SenderId)
            .NotEmpty().WithMessage("SenderId is required.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Message content cannot be empty.")
            .MaximumLength(2000).WithMessage("Message content cannot exceed 2000 characters.");
    }
}
