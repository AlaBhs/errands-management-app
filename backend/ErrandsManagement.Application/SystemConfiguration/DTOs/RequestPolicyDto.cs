using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.SystemConfiguration.DTOs;

public sealed record RequestPolicyDto(
    List<RequestCategory> EnabledCategories,
    bool IsContactPersonRequired,
    int MinDeadlineAdvanceHours);