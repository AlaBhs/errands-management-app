using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.SystemConfiguration.DTOs;

public sealed record PublicConfigDto(
    List<RequestCategory> EnabledCategories,
    int MinDeadlineAdvanceHours,
    Dictionary<RequestCategory, decimal> CategoryBudgetCaps);