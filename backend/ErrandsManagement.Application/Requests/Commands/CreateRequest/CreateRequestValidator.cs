using FluentValidation;

namespace ErrandsManagement.Application.Requests.Commands.CreateRequest;



public sealed class CreateRequestValidator
    : AbstractValidator<CreateRequestCommand>
{
    public CreateRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .NotEmpty()
            .MaximumLength(1000);

        RuleFor(x => x.RequesterId)
            .NotEmpty();

        RuleFor(x => x.DeliveryAddress)
            .NotNull();

        RuleFor(x => x.DeliveryAddress.Street)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.DeliveryAddress.City)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.DeliveryAddress.Country)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.EstimatedCost)
            .GreaterThanOrEqualTo(0)
            .When(x => x.EstimatedCost.HasValue);
    }
}

