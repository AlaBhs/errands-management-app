using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.UserPreferences.DTOs
{
    public sealed record CollaboratorDefaultsDto(
        RequestCategory? DefaultCategory,
        PriorityLevel? DefaultPriority,
        string? DefaultContactPerson,
        string? DefaultContactPhone);
}
