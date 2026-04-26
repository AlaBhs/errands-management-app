using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.DeliveryBatches.Queries.GetDeliveryBatches;

public sealed class DeliveryBatchQueryParameters
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;

    public DeliveryBatchStatus? Status { get; init; }
    public string? Search { get; init; }   // title or client name
}