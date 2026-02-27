using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Entities;

public class Attachment : BaseEntity
{
    public Guid RequestId { get; private set; }

    public string FileName { get; private set; }
    public string ContentType { get; private set; }
    public string Uri { get; private set; }
    public DateTime UploadedAt { get; private set; }

    private Attachment() { }

    public Attachment(Guid requestId, string fileName, string contentType, string uri)
    {
        RequestId = requestId;
        FileName = fileName;
        ContentType = contentType;
        Uri = uri;
        UploadedAt = DateTime.UtcNow;
    }
}