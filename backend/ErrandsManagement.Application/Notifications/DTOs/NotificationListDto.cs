namespace ErrandsManagement.Application.Notifications.DTOs;

public sealed record NotificationListDto(
    IReadOnlyList<NotificationDto> Notifications,
    int UnreadCount);