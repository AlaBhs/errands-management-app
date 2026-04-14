namespace ErrandsManagement.Application.DTOs
{
    public sealed record RequestListItemDto(
        Guid Id,
        string Title,
        string Description,
        string Status,
        string Priority,
        decimal? EstimatedCost,
        DateTime? Deadline);
}
