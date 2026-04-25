using FluentValidation;

namespace ErrandsManagement.Application.RequestTemplates.Commands.CreateRequestTemplate;

public sealed class CreateRequestTemplateFromRequestValidator
    : AbstractValidator<CreateRequestTemplateFromRequestCommand>
{
    public CreateRequestTemplateFromRequestValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty().WithMessage("RequestId is required.");

        RuleFor(x => x.TemplateName)
            .NotEmpty().WithMessage("Template name is required.")
            .MaximumLength(100).WithMessage("Template name must not exceed 100 characters.");
    }
}