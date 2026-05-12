namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record AssignmentDto(
    Guid CourierId,
    string CourierName,
    DateTime AssignedAt,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    decimal? ActualCost,
    string? Note);
}
