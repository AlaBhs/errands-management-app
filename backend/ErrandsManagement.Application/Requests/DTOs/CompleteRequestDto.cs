namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record CompleteRequestDto(
        decimal? ActualCost,
        string? Note);
}
