namespace ErrandsManagement.Application.SystemConfiguration.DTOs;


public sealed record SlaPolicyDto(
    int RiskThresholdPercent,
    int MonitorIntervalMinutes,
    int AlertCooldownHours);