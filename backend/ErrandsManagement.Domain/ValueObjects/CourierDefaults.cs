namespace ErrandsManagement.Domain.ValueObjects;

public sealed record CourierDefaults
{
    public double? BaseLatitude { get; init; }
    public double? BaseLongitude { get; init; }
    public string? BaseCity { get; init; }
    public int? MaxConcurrentAssignments { get; init; }
    public HashSet<DayOfWeek> AvailableDaysOfWeek { get; init; } = new();
    public int? AvailableFromHour { get; init; }
    public int? AvailableToHour { get; init; }
}