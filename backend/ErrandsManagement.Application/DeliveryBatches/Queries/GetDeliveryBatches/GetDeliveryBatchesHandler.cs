using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DeliveryBatches.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Queries.GetDeliveryBatches;

public sealed class GetDeliveryBatchesHandler
    : IRequestHandler<GetDeliveryBatchesQuery, PagedResult<DeliveryBatchListItemDto>>
{
    private readonly IDeliveryBatchRepository _repository;

    public GetDeliveryBatchesHandler(IDeliveryBatchRepository repository)
        => _repository = repository;

    public Task<PagedResult<DeliveryBatchListItemDto>> Handle(
        GetDeliveryBatchesQuery request,
        CancellationToken cancellationToken)
        => _repository.GetPagedAsync(request.Parameters, cancellationToken);
}