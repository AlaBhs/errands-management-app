using FluentValidation;

namespace ErrandsManagement.Application.Requests.Commands.SubmitSurvey;


public sealed class SubmitSurveyValidator
    : AbstractValidator<SubmitSurveyCommand>
{
    public SubmitSurveyValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty();

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5);

        RuleFor(x => x.Comment)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrWhiteSpace(x.Comment));
    }
}