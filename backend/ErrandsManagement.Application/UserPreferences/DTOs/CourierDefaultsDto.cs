

namespace ErrandsManagement.Application.UserPreferences.DTOs
{
    public sealed record CourierDefaultsDto(
        double? BaseLatitude,
        double? BaseLongitude,
        string? BaseCity,
        int? MaxConcurrentAssignments,
        List<DayOfWeek> AvailableDaysOfWeek,
        int? AvailableFromHour,
        int? AvailableToHour);
}
