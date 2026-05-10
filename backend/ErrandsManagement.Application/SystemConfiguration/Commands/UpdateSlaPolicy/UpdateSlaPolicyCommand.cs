using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateSlaPolicy;

public sealed record UpdateSlaPolicyCommand(
    Guid ChangedBy,
    int RiskThresholdPercent,
    int MonitorIntervalMinutes,
    int AlertCooldownHours) : IRequest<Unit>;