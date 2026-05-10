using System.Text.Json;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateExpensePolicy;

public sealed class UpdateExpensePolicyHandler : IRequestHandler<UpdateExpensePolicyCommand, Unit>
{
    private readonly ISystemConfigurationRepository _repo;
    private readonly IMediator _mediator;

    public UpdateExpensePolicyHandler(ISystemConfigurationRepository repo, IMediator mediator)
    {
        _repo = repo;
        _mediator = mediator;
    }

    public async Task<Unit> Handle(UpdateExpensePolicyCommand cmd, CancellationToken ct)
    {
        var config = await _repo.GetAsync(ct);
        var previousJson = JsonSerializer.Serialize(config.ExpensePolicy);

        config.UpdateExpensePolicy(new ExpensePolicy
        {
            CategoryBudgetCaps = cmd.CategoryBudgetCaps,
            OverrunFlagThresholdPercent = cmd.OverrunFlagThresholdPercent
        }, cmd.ChangedBy);

        var newJson = JsonSerializer.Serialize(config.ExpensePolicy);

        await _repo.UpdateAsync(config, ct);
        await _repo.AddChangeLogAsync(
            ConfigurationChangeLog.Create(cmd.ChangedBy, "ExpensePolicy", previousJson, newJson), ct);
        await _repo.SaveChangesAsync(ct);

        foreach (var evt in config.DomainEvents) await _mediator.Publish(evt, ct);
        config.ClearDomainEvents();

        return Unit.Value;
    }
}