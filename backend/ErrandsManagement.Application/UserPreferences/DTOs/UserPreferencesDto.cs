using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.UserPreferences.DTOs
{
    public sealed record UserPreferencesDto(
        Guid UserId,
        string? Language,
        string? Theme,
        string? DefaultView,
        List<NotificationType> DisabledNotificationTypes,
        CollaboratorDefaultsDto? CollaboratorDefaults,
        CourierDefaultsDto? CourierDefaults);
}
