namespace ErrandsManagement.Application.DTOs

{
    public sealed record RequestDetailsDto(
    Guid Id,
    string Title,
    string Description,
    string Status,
    string Priority,
    DateTime? Deadline,
    decimal? EstimatedCost,
    Guid RequesterId);
}
