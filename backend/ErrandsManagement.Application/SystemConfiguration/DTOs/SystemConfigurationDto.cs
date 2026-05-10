namespace ErrandsManagement.Application.SystemConfiguration.DTOs;

public sealed record SystemConfigurationDto(
    RecommendationPolicyDto RecommendationPolicy,
    SlaPolicyDto SlaPolicy,
    ExpensePolicyDto ExpensePolicy,
    NotificationPolicyDto NotificationPolicy,
    RequestPolicyDto RequestPolicy);