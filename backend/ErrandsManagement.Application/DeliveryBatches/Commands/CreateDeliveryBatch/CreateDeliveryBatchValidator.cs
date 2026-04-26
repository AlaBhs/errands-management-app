using FluentValidation;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.CreateDeliveryBatch;

public sealed class CreateDeliveryBatchValidator
    : AbstractValidator<CreateDeliveryBatchCommand>
{
    public CreateDeliveryBatchValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200);

        RuleFor(x => x.ClientName)
            .NotEmpty().WithMessage("ClientName is required.")
            .MaximumLength(200);
    }
}