using ErrandsManagement.Application.Requests.DTOs;

namespace ErrandsManagement.Application.RequestTemplates.DTOs;

public sealed record RequestTemplateDetailsDto(
    Guid Id,
    string Name,
    string Title,
    string Description,
    string Category,
    AddressDto Address,
    decimal? EstimatedCost,
    string? ContactPerson,
    string? ContactPhone,
    DateTime CreatedAt);