

namespace ErrandsManagement.Application.DeliveryBatches.DTOs
{
    public sealed record DeliveryBatchAttachmentDto(
    Guid Id,
    string FileName,
    string ContentType,
    string Uri,
    DateTime UploadedAt);
}
