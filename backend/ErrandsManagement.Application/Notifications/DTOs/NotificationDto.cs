using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.Notifications.DTOs;

public sealed record NotificationDto(
    Guid Id,
    string Message,
    NotificationType Type,
    Guid? ReferenceId,
    bool IsRead,
    DateTime CreatedAt);