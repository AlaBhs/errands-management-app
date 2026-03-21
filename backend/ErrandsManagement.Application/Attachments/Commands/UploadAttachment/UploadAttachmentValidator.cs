using FluentValidation;

namespace ErrandsManagement.Application.Attachments.Commands.UploadAttachment;

public sealed class UploadAttachmentValidator
    : AbstractValidator<UploadAttachmentCommand>
{
    private static readonly string[] AllowedContentTypes =
    [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
    ];

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    public UploadAttachmentValidator()
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
            .WithMessage(
                $"Only images (JPEG, PNG, GIF, WEBP) and PDF files are allowed.");

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