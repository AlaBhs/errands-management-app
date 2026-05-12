namespace ErrandsManagement.Application.RequestTemplates.DTOs;

public sealed record RequestTemplateListItemDto(
    Guid Id,
    string Name,
    string Title,
    string Category,
    decimal? EstimatedCost,
    DateTime CreatedAt);