using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.Requests.Commands.CreateRequest;

public sealed record CreateRequestCommand(
    Guid RequesterId,
    string Title,
    string Description,
    string Street,
    string City,
    string PostalCode,
    string Country,
    string? Note,
    PriorityLevel Priority,
    DateTime? Deadline,
    decimal? EstimatedCost);