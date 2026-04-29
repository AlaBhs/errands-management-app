using FluentValidation;
using System.Xml.Linq;

namespace ErrandsManagement.Application.Requests.Commands.CompleteRequest;


public sealed class CompleteRequestValidator
    : AbstractValidator<CompleteRequestCommand>
{
    private static readonly Dictionary<string, string[]> AllowedImageTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = [".jpg", ".jpeg"],
            ["image/png"] = [".png"],
            ["image/gif"] = [".gif"],
            ["image/webp"] = [".webp"],
        };

    private const long MaxFileSizeBytes = 10 * 1024 * 1024;

    public CompleteRequestValidator()
    {
        RuleFor(x => x.RequestId)
            .NotEmpty()
            .WithMessage("Request ID is required.");


        // Only validate photo fields when a photo is provided
        When(x => x.DischargePhotoStream is not null, () =>
        {


    RuleFor(x => x.DischargePhotoFileName)
        .NotEmpty()
        .WithMessage("File name is required.")
        .Must(name => {
        var ext = Path.GetExtension(name ?? "");
        return !string.IsNullOrEmpty(ext) &&
               AllowedImageTypes.Values.Any(exts =>
                   exts.Contains(ext, StringComparer.OrdinalIgnoreCase));
    })
        .WithMessage("Discharge photo extension not allowed.");

    RuleFor(x => x.DischargePhotoContentType)
        .Must(ct => ct != null && AllowedImageTypes.ContainsKey(ct))
        .WithMessage("Discharge photo must be an image (JPEG, PNG, GIF, WEBP).");

    RuleFor(x => x.DischargePhotoSize)
        .GreaterThan(0)
        .WithMessage("Discharge photo must not be empty.")
        .LessThanOrEqualTo(MaxFileSizeBytes)
        .WithMessage("Discharge photo must not exceed 10 MB.");
});
    }
}