using MediatR;

namespace ErrandsManagement.Application.UserPreferences.Commands.UpdateCourierDefaults;

public sealed record UpdateCourierDefaultsCommand(
    Guid UserId,
    double? BaseLatitude,
    double? BaseLongitude,
    string? BaseCity,
    int? MaxConcurrentAssignments,
    HashSet<DayOfWeek> AvailableDaysOfWeek,
    int? AvailableFromHour,
    int? AvailableToHour) : IRequest<Unit>;