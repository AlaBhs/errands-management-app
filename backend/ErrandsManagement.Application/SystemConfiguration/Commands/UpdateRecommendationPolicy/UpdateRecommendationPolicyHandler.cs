using System.Text.Json;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateRecommendationPolicy;

public sealed class UpdateRecommendationPolicyHandler
    : IRequestHandler<UpdateRecommendationPolicyCommand, Unit>
{
    private readonly ISystemConfigurationRepository _repo;
    private readonly IMediator _mediator;

    public UpdateRecommendationPolicyHandler(
        ISystemConfigurationRepository repo,
        IMediator mediator)
    {
        _repo = repo;
        _mediator = mediator;
    }

    public async Task<Unit> Handle(
        UpdateRecommendationPolicyCommand cmd,
        CancellationToken ct)
    {
        var config = await _repo.GetAsync(ct);

        var previousJson = JsonSerializer.Serialize(config.RecommendationPolicy);

        var newPolicy = new RecommendationPolicy
        {
            MaxActiveAssignments = cmd.MaxActiveAssignments,
            MaxScoringDistanceKm = cmd.MaxScoringDistanceKm,
            NormalPriorityWeights = new PriorityWeights(
                cmd.NormalAvailabilityWeight,
                cmd.NormalProximityWeight,
                cmd.NormalPerformanceWeight),
            UrgentPriorityWeights = new PriorityWeights(
                cmd.UrgentAvailabilityWeight,
                cmd.UrgentProximityWeight,
                cmd.UrgentPerformanceWeight)
        };

        config.UpdateRecommendationPolicy(newPolicy, cmd.ChangedBy);

        var newJson = JsonSerializer.Serialize(config.RecommendationPolicy);

        await _repo.UpdateAsync(config, ct);

        var log = ConfigurationChangeLog.Create(
            cmd.ChangedBy,
            "RecommendationPolicy",
            previousJson,
            newJson);

        await _repo.AddChangeLogAsync(log, ct);
        await _repo.SaveChangesAsync(ct);

        foreach (var domainEvent in config.DomainEvents)
            await _mediator.Publish(domainEvent, ct);

        config.ClearDomainEvents();

        return Unit.Value;
    }
}