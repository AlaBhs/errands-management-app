using ErrandsManagement.Domain.Enums;
namespace ErrandsManagement.Application.Requests.Commands.CreateRequest;

using ErrandsManagement.Application.DTOs;
using MediatR;

public sealed record CreateRequestCommand(
    string Title,
    string Description,
    AddressDto DeliveryAddress,
    PriorityLevel Priority,
    DateTime? Deadline,
    decimal? EstimatedCost,
    Guid RequesterId)
    : IRequest<Guid>;