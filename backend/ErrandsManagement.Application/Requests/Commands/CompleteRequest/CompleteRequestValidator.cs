using FluentValidation;

namespace ErrandsManagement.Application.Requests.Commands.CompleteRequest;


public sealed class CompleteRequestValidator
    : AbstractValidator<CompleteRequestCommand>
{
    private static readonly string[] AllowedImageTypes =
    [
        "image/jpeg", "image/png",
        "image/gif",  "image/webp",
    ];

    private const long MaxFileSizeBytes = 10 * 1024 * 1024;

    public CompleteRequestValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty()
            .WithMessage("Request ID is required.");

        RuleFor(x => x.ActualCost)
            .GreaterThanOrEqualTo(0)
            .When(x => x.ActualCost.HasValue)
            .WithMessage("Actual cost must be a positive number.");

        // Only validate photo fields when a photo is provided
        When(x => x.DischargePhotoStream is not null, () =>
        {
            RuleFor(x => x.DischargePhotoContentType)
                .Must(ct => ct != null &&
                      AllowedImageTypes.Contains(ct.ToLowerInvariant()))
                .WithMessage(
                    "Discharge photo must be an image (JPEG, PNG, GIF, WEBP).");

            RuleFor(x => x.DischargePhotoSize)
                .GreaterThan(0)
                .WithMessage("Discharge photo must not be empty.")
                .LessThanOrEqualTo(MaxFileSizeBytes)
                .WithMessage("Discharge photo must not exceed 10 MB.");
        });
    }
}