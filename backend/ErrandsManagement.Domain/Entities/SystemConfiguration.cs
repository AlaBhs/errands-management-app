using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Events;
using ErrandsManagement.Domain.ValueObjects;

namespace ErrandsManagement.Domain.Entities;

public sealed class SystemConfiguration : BaseEntity
{
    private SystemConfiguration() { }

    public RecommendationPolicy RecommendationPolicy { get; private set; } = new();
    public SlaPolicy SlaPolicy { get; private set; } = new();
    public ExpensePolicy ExpensePolicy { get; private set; } = new();
    public NotificationPolicy NotificationPolicy { get; private set; } = new();
    public RequestPolicy RequestPolicy { get; private set; } = new();


    public static SystemConfiguration CreateDefault()
    {
        return new SystemConfiguration
        {
            Id = Guid.NewGuid(),
        };
    }

    public void UpdateRecommendationPolicy(RecommendationPolicy policy, Guid changedBy)
    {
        policy.Validate();
        RecommendationPolicy = policy;
        MarkAsUpdated();
        RaiseDomainEvent(new SystemConfigurationUpdatedEvent(nameof(RecommendationPolicy), changedBy));
    }

    public void UpdateSlaPolicy(SlaPolicy policy, Guid changedBy)
    {
        SlaPolicy = policy;
        MarkAsUpdated();
        RaiseDomainEvent(new SystemConfigurationUpdatedEvent(nameof(SlaPolicy), changedBy));
    }

    public void UpdateExpensePolicy(ExpensePolicy policy, Guid changedBy)
    {
        ExpensePolicy = policy;
        MarkAsUpdated();
        RaiseDomainEvent(new SystemConfigurationUpdatedEvent(nameof(ExpensePolicy), changedBy));
    }

    public void UpdateNotificationPolicy(NotificationPolicy policy, Guid changedBy)
    {
        NotificationPolicy = policy;
        MarkAsUpdated();
        RaiseDomainEvent(new SystemConfigurationUpdatedEvent(nameof(NotificationPolicy), changedBy));
    }

    public void UpdateRequestPolicy(RequestPolicy policy, Guid changedBy)
    {
        RequestPolicy = policy;
        MarkAsUpdated();
        RaiseDomainEvent(new SystemConfigurationUpdatedEvent(nameof(RequestPolicy), changedBy));
    }
}