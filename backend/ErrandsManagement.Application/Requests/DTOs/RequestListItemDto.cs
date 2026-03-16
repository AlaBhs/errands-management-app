namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record RequestListItemDto(
        Guid Id,
        string Title,
        string Description,
        string Status,
        string Priority,
        string Category,
        decimal? EstimatedCost,
        DateTime? Deadline);
}
