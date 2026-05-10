using FluentValidation;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateSlaPolicy;

public sealed class UpdateSlaPolicyValidator : AbstractValidator<UpdateSlaPolicyCommand>
{
    public UpdateSlaPolicyValidator()
    {
        RuleFor(x => x.RiskThresholdPercent).InclusiveBetween(1, 99);
        RuleFor(x => x.MonitorIntervalMinutes).GreaterThan(0);
        RuleFor(x => x.AlertCooldownHours).GreaterThan(0);
    }
}