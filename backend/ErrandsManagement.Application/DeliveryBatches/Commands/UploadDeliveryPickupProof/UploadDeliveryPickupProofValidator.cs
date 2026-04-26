using FluentValidation;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.UploadDeliveryPickupProof;

public sealed class UploadDeliveryPickupProofValidator
    : AbstractValidator<UploadDeliveryPickupProofCommand>
{
    // Images only — pickup proof is visual evidence (photo or signature scan)
    private static readonly Dictionary<string, string[]> AllowedTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = [".jpg", ".jpeg"],
            ["image/png"] = [".png"],
            ["image/webp"] = [".webp"],
        };

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    public UploadDeliveryPickupProofValidator()
    {
        RuleFor(x => x.BatchId)
            .NotEmpty()
            .WithMessage("BatchId is required.");

        RuleFor(x => x.FileName)
            .NotEmpty()
            .WithMessage("File name is required.")
            .MaximumLength(255)
            .Must(HaveAllowedExtension)
            .WithMessage("Only image files are allowed (.jpg, .jpeg, .png, .webp).");

        RuleFor(x => x.ContentType)
            .NotEmpty()
            .Must(ct => AllowedTypes.ContainsKey(ct))
            .WithMessage("Only image content types are accepted (JPEG, PNG, WEBP).");

        RuleFor(x => x)
            .Must(cmd => ExtensionMatchesContentType(cmd.FileName, cmd.ContentType))
            .WithMessage("File extension does not match the content type.")
            .When(cmd =>
                !string.IsNullOrEmpty(cmd.FileName) &&
                !string.IsNullOrEmpty(cmd.ContentType) &&
                AllowedTypes.ContainsKey(cmd.ContentType));

        RuleFor(x => x.FileSize)
            .GreaterThan(0).WithMessage("File must not be empty.")
            .LessThanOrEqualTo(MaxFileSizeBytes).WithMessage("File size must not exceed 10 MB.");
    }

    private static bool HaveAllowedExtension(string fileName)
    {
        var ext = Path.GetExtension(fileName);
        return !string.IsNullOrEmpty(ext) &&
               AllowedTypes.Values.Any(exts =>
                   exts.Contains(ext, StringComparer.OrdinalIgnoreCase));
    }

    private static bool ExtensionMatchesContentType(string fileName, string contentType)
    {
        var ext = Path.GetExtension(fileName);
        if (string.IsNullOrEmpty(ext)) return false;
        return AllowedTypes.TryGetValue(contentType, out var allowed) &&
               allowed.Contains(ext, StringComparer.OrdinalIgnoreCase);
    }
}