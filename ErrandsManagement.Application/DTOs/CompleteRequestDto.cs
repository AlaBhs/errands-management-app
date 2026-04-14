namespace ErrandsManagement.Application.DTOs
{
    public sealed record CompleteRequestDto(
        decimal? ActualCost,
        string? Note);
}
