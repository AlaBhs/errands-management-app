

using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.Attachments.DTOs
{
    public sealed record AttachmentDto(
        Guid Id,
        string FileName,
        string ContentType,
        string Uri,
        AttachmentType Type,
        DateTime UploadedAt
    );
}
