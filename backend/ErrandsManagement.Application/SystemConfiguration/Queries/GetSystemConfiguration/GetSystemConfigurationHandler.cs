using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.SystemConfiguration.DTOs;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Queries.GetSystemConfiguration;

public sealed class GetSystemConfigurationHandler
    : IRequestHandler<GetSystemConfigurationQuery, SystemConfigurationDto>
{
    private readonly ISystemConfigReader _reader;

    public GetSystemConfigurationHandler(ISystemConfigReader reader)
    {
        _reader = reader;
    }

    public async Task<SystemConfigurationDto> Handle(
        GetSystemConfigurationQuery request, CancellationToken ct)
    {
        var config = await _reader.GetAsync(ct);

        return new SystemConfigurationDto(
            RecommendationPolicy: new RecommendationPolicyDto(
                config.RecommendationPolicy.MaxActiveAssignments,
                config.RecommendationPolicy.MaxScoringDistanceKm,
                new PriorityWeightsDto(
                    config.RecommendationPolicy.NormalPriorityWeights.AvailabilityWeight,
                    config.RecommendationPolicy.NormalPriorityWeights.ProximityWeight,
                    config.RecommendationPolicy.NormalPriorityWeights.PerformanceWeight),
                new PriorityWeightsDto(
                    config.RecommendationPolicy.UrgentPriorityWeights.AvailabilityWeight,
                    config.RecommendationPolicy.UrgentPriorityWeights.ProximityWeight,
                    config.RecommendationPolicy.UrgentPriorityWeights.PerformanceWeight)),
            SlaPolicy: new SlaPolicyDto(
                config.SlaPolicy.RiskThresholdPercent,
                config.SlaPolicy.MonitorIntervalMinutes,
                config.SlaPolicy.AlertCooldownHours),
            ExpensePolicy: new ExpensePolicyDto(
                config.ExpensePolicy.CategoryBudgetCaps,
                config.ExpensePolicy.OverrunFlagThresholdPercent),
            NotificationPolicy: new NotificationPolicyDto(
                config.NotificationPolicy.DisabledTypesByRole
                    .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.ToList())),
            RequestPolicy: new RequestPolicyDto(
                config.RequestPolicy.EnabledCategories.ToList(),
                config.RequestPolicy.IsContactPersonRequired,
                config.RequestPolicy.MinDeadlineAdvanceHours));
    }
}