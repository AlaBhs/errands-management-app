using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Domain.Entities;

public class Attachment : BaseEntity
{
    public Guid RequestId { get; private set; }

    public string FileName { get; private set; }
    public string ContentType { get; private set; }
    public string Uri { get; private set; }
    public AttachmentType Type { get; private set; }
    public DateTime UploadedAt { get; private set; }

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
    private Attachment() { }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

    public Attachment(Guid requestId, string fileName, string contentType, string uri, AttachmentType type = AttachmentType.Document)
    {
        RequestId = requestId;
        FileName = fileName;
        ContentType = contentType;
        Uri = uri;
        Type = type;
        UploadedAt = DateTime.UtcNow;
    }
}