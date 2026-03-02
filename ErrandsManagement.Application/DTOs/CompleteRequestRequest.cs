namespace ErrandsManagement.Application.DTOs
{
    public sealed record CompleteRequestRequest(
        decimal? ActualCost,
        string? Note);
}
