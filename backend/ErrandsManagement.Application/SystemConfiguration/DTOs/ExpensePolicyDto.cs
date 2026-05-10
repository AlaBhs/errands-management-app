using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.SystemConfiguration.DTOs;

public sealed record ExpensePolicyDto(
    Dictionary<RequestCategory, decimal> CategoryBudgetCaps,
    int OverrunFlagThresholdPercent);