using System.Text.Json;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateSlaPolicy;

public sealed class UpdateSlaPolicyHandler : IRequestHandler<UpdateSlaPolicyCommand, Unit>
{
    private readonly ISystemConfigurationRepository _repo;
    private readonly IMediator _mediator;

    public UpdateSlaPolicyHandler(ISystemConfigurationRepository repo, IMediator mediator)
    {
        _repo = repo;
        _mediator = mediator;
    }

    public async Task<Unit> Handle(UpdateSlaPolicyCommand cmd, CancellationToken ct)
    {
        var config = await _repo.GetAsync(ct);
        var previousJson = JsonSerializer.Serialize(config.SlaPolicy);

        config.UpdateSlaPolicy(new SlaPolicy
        {
            RiskThresholdPercent = cmd.RiskThresholdPercent,
            MonitorIntervalMinutes = cmd.MonitorIntervalMinutes,
            AlertCooldownHours = cmd.AlertCooldownHours
        }, cmd.ChangedBy);

        var newJson = JsonSerializer.Serialize(config.SlaPolicy);

        await _repo.UpdateAsync(config, ct);
        await _repo.AddChangeLogAsync(
            ConfigurationChangeLog.Create(cmd.ChangedBy, "SlaPolicy", previousJson, newJson), ct);
        await _repo.SaveChangesAsync(ct);

        foreach (var evt in config.DomainEvents) await _mediator.Publish(evt, ct);
        config.ClearDomainEvents();

        return Unit.Value;
    }
}