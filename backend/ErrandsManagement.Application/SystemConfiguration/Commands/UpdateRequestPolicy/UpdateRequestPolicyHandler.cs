using System.Text.Json;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateRequestPolicy;

public sealed class UpdateRequestPolicyHandler : IRequestHandler<UpdateRequestPolicyCommand, Unit>
{
    private readonly ISystemConfigurationRepository _repo;
    private readonly IMediator _mediator;

    public UpdateRequestPolicyHandler(ISystemConfigurationRepository repo, IMediator mediator)
    {
        _repo = repo;
        _mediator = mediator;
    }

    public async Task<Unit> Handle(UpdateRequestPolicyCommand cmd, CancellationToken ct)
    {
        var config = await _repo.GetAsync(ct);
        var previousJson = JsonSerializer.Serialize(config.RequestPolicy);

        config.UpdateRequestPolicy(new RequestPolicy
        {
            EnabledCategories = cmd.EnabledCategories,
            IsContactPersonRequired = cmd.IsContactPersonRequired,
            MinDeadlineAdvanceHours = cmd.MinDeadlineAdvanceHours
        }, cmd.ChangedBy);

        var newJson = JsonSerializer.Serialize(config.RequestPolicy);

        await _repo.UpdateAsync(config, ct);
        await _repo.AddChangeLogAsync(
            ConfigurationChangeLog.Create(cmd.ChangedBy, "RequestPolicy", previousJson, newJson), ct);
        await _repo.SaveChangesAsync(ct);

        foreach (var evt in config.DomainEvents) await _mediator.Publish(evt, ct);
        config.ClearDomainEvents();

        return Unit.Value;
    }
}