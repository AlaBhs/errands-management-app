using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Entities;

public sealed class DeliveryBatchAttachment : BaseEntity
{
    public Guid DeliveryBatchId { get; private set; }
    public string FileName { get; private set; }
    public string ContentType { get; private set; }
    public string Uri { get; private set; }
    public DateTime UploadedAt { get; private set; }

#pragma warning disable CS8618
    private DeliveryBatchAttachment() { }
#pragma warning restore CS8618

    public DeliveryBatchAttachment(
        Guid deliveryBatchId,
        string fileName,
        string contentType,
        string uri)
    {
        DeliveryBatchId = deliveryBatchId;
        FileName = fileName;
        ContentType = contentType;
        Uri = uri;
        UploadedAt = DateTime.UtcNow;
    }
}