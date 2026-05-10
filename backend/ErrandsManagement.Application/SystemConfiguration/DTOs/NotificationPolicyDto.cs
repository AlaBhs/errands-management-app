using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.SystemConfiguration.DTOs;

public sealed record NotificationPolicyDto(
    Dictionary<NotificationType, List<UserRole>> DisabledTypesByRole);

