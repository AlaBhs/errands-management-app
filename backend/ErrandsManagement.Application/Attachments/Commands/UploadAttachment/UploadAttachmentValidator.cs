
using FluentValidation;

namespace ErrandsManagement.Application.Attachments.Commands.UploadAttachment;

public sealed class UploadAttachmentValidator
    : AbstractValidator<UploadAttachmentCommand>
{
    private static readonly Dictionary<string, string[]> AllowedTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = [".jpg", ".jpeg"],
            ["image/png"] = [".png"],
            ["image/gif"] = [".gif"],
            ["image/webp"] = [".webp"],
            ["application/pdf"] = [".pdf"],
        };

    private const long MaxFileSizeBytes = 10 * 1024 * 1024;

    public UploadAttachmentValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty()
            .WithMessage("Request ID is required.");

        RuleFor(x => x.FileName)
            .NotEmpty()
            .WithMessage("File name is required.")
            .MaximumLength(255)
            .WithMessage("File name must not exceed 255 characters.")
            .Must(HaveAllowedExtension)
            .WithMessage(
                $"File extension not allowed. " +
                $"Allowed extensions: .jpg, .jpeg, .png, .gif, .webp, .pdf");

        RuleFor(x => x.ContentType)
            .NotEmpty()
            .WithMessage("Content type is required.")
            .Must(ct => AllowedTypes.ContainsKey(ct))
            .WithMessage(
                "File type not allowed. " +
                "Only images (JPEG, PNG, GIF, WEBP) and PDF files are accepted.");

        RuleFor(x => x)
            .Must(cmd => ExtensionMatchesContentType(cmd.FileName, cmd.ContentType))
            .WithMessage("File extension does not match the file content type.")
            .When(cmd =>
                !string.IsNullOrEmpty(cmd.FileName) &&
                !string.IsNullOrEmpty(cmd.ContentType) &&
                AllowedTypes.ContainsKey(cmd.ContentType));

        RuleFor(x => x.FileSize)
            .GreaterThan(0)
            .WithMessage("File must not be empty.")
            .LessThanOrEqualTo(MaxFileSizeBytes)
            .WithMessage("File size must not exceed 10 MB.");
    }

    private static bool HaveAllowedExtension(string fileName)
    {
        var ext = Path.GetExtension(fileName);
        if (string.IsNullOrEmpty(ext)) return false;
        return AllowedTypes.Values
            .Any(exts => exts.Contains(ext, StringComparer.OrdinalIgnoreCase));
    }

    private static bool ExtensionMatchesContentType(
        string fileName, string contentType)
    {
        var ext = Path.GetExtension(fileName);
        if (string.IsNullOrEmpty(ext)) return false;
        if (!AllowedTypes.TryGetValue(contentType, out var allowedExts))
            return false;
        return allowedExts.Contains(ext, StringComparer.OrdinalIgnoreCase);
    }
}