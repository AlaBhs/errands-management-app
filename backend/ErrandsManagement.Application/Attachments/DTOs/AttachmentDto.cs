

namespace ErrandsManagement.Application.Attachments.DTOs
{
    public sealed record AttachmentDto(
        Guid Id,
        string FileName,
        string ContentType,
        string Uri,
        DateTime UploadedAt
    );
}
