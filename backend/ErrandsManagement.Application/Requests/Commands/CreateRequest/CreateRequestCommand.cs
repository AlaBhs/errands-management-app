using ErrandsManagement.Domain.Enums;
namespace ErrandsManagement.Application.Requests.Commands.CreateRequest;

using ErrandsManagement.Application.Requests.DTOs;
using MediatR;

public sealed record CreateRequestCommand(
    string Title,
    string Description,
    AddressDto DeliveryAddress,
    PriorityLevel Priority,
    RequestCategory Category,
    string? ContactPerson,
    string? ContactPhone,
    DateTime? Deadline,
    decimal? EstimatedCost,
    Guid RequesterId)
    : IRequest<Guid>;