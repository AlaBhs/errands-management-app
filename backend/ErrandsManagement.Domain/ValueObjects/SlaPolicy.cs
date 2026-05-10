namespace ErrandsManagement.Domain.ValueObjects;

public sealed record SlaPolicy
{
    public int RiskThresholdPercent { get; init; } = 20;
    public int MonitorIntervalMinutes { get; init; } = 5;
    public int AlertCooldownHours { get; init; } = 2;
}