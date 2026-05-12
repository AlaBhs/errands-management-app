using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DeliveryBatches.DTOs;
using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Queries.GetDeliveryBatches;

public sealed record GetDeliveryBatchesQuery(
    DeliveryBatchQueryParameters Parameters
) : IRequest<PagedResult<DeliveryBatchListItemDto>>;