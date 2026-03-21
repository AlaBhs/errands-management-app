using FluentValidation;

namespace ErrandsManagement.Application.Attachments.Commands.UploadDischargePhoto;

public sealed class UploadDischargePhotoValidator
    : AbstractValidator<UploadDischargePhotoCommand>
{
    // Discharge photos are images only — no PDFs
    private static readonly string[] AllowedContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
    ];

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    public UploadDischargePhotoValidator()
    {
        RuleFor(x => x.FileName)
            .NotEmpty()
            .WithMessage("File name is required.")
            .MaximumLength(255)
            .WithMessage("File name must not exceed 255 characters.");

        RuleFor(x => x.ContentType)
            .NotEmpty()
            .WithMessage("Content type is required.")
            .Must(ct => AllowedContentTypes.Contains(ct.ToLowerInvariant()))
            .WithMessage("Discharge photo must be an image (JPEG, PNG, GIF, WEBP).");

        RuleFor(x => x.FileSize)
            .GreaterThan(0)
            .WithMessage("File must not be empty.")
            .LessThanOrEqualTo(MaxFileSizeBytes)
            .WithMessage("File size must not exceed 10 MB.");

        RuleFor(x => x.RequestId)
            .NotEmpty()
            .WithMessage("Request ID is required.");
    }
}