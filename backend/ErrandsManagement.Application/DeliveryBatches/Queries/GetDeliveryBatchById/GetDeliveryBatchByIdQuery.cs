using ErrandsManagement.Application.DeliveryBatches.DTOs;
using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Queries.GetDeliveryBatchById;

public sealed record GetDeliveryBatchByIdQuery(Guid Id)
    : IRequest<DeliveryBatchDto>;