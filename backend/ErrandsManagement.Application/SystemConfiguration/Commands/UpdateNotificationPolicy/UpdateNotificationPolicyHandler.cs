using System.Text.Json;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateNotificationPolicy;

public sealed class UpdateNotificationPolicyHandler
    : IRequestHandler<UpdateNotificationPolicyCommand, Unit>
{
    private readonly ISystemConfigurationRepository _repo;
    private readonly IMediator _mediator;

    public UpdateNotificationPolicyHandler(ISystemConfigurationRepository repo, IMediator mediator)
    {
        _repo = repo;
        _mediator = mediator;
    }

    public async Task<Unit> Handle(UpdateNotificationPolicyCommand cmd, CancellationToken ct)
    {
        var config = await _repo.GetAsync(ct);
        var previousJson = JsonSerializer.Serialize(config.NotificationPolicy);

        config.UpdateNotificationPolicy(new NotificationPolicy
        {
            DisabledTypesByRole = cmd.DisabledTypesByRole
        }, cmd.ChangedBy);

        var newJson = JsonSerializer.Serialize(config.NotificationPolicy);

        await _repo.UpdateAsync(config, ct);
        await _repo.AddChangeLogAsync(
            ConfigurationChangeLog.Create(cmd.ChangedBy, "NotificationPolicy", previousJson, newJson), ct);
        await _repo.SaveChangesAsync(ct);

        foreach (var evt in config.DomainEvents) await _mediator.Publish(evt, ct);
        config.ClearDomainEvents();

        return Unit.Value;
    }
}