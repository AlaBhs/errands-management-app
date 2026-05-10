using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Domain.ValueObjects;

public sealed record ExpensePolicy
{
    public Dictionary<RequestCategory, decimal> CategoryBudgetCaps { get; init; } = new();
    public int OverrunFlagThresholdPercent { get; init; } = 20;
}