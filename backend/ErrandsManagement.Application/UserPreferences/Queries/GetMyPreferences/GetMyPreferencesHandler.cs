using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.UserPreferences.DTOs;
using MediatR;

namespace ErrandsManagement.Application.UserPreferences.Queries.GetMyPreferences;

public sealed class GetMyPreferencesHandler
    : IRequestHandler<GetMyPreferencesQuery, UserPreferencesDto>
{
    private readonly IUserPreferencesRepository _repo;

    public GetMyPreferencesHandler(IUserPreferencesRepository repo)
    {
        _repo = repo;
    }

    public async Task<UserPreferencesDto> Handle(GetMyPreferencesQuery request, CancellationToken ct)
    {
        var prefs = await _repo.GetByUserIdAsync(request.UserId, ct);

        if (prefs is null)
        {
            return new UserPreferencesDto(
                UserId: request.UserId,
                Language: null,
                Theme: null,
                DefaultView: null,
                DisabledNotificationTypes: [],
                CollaboratorDefaults: null,
                CourierDefaults: null);
        }

        return new UserPreferencesDto(
            UserId: prefs.UserId,
            Language: prefs.Language,
            Theme: prefs.Theme,
            DefaultView: prefs.DefaultView,
            DisabledNotificationTypes: prefs.DisabledNotificationTypes.ToList(),
            CollaboratorDefaults: prefs.CollaboratorDefaults is null ? null
                : new CollaboratorDefaultsDto(
                    prefs.CollaboratorDefaults.DefaultCategory,
                    prefs.CollaboratorDefaults.DefaultPriority,
                    prefs.CollaboratorDefaults.DefaultContactPerson,
                    prefs.CollaboratorDefaults.DefaultContactPhone),
            CourierDefaults: prefs.CourierDefaults is null ? null
                : new CourierDefaultsDto(
                    prefs.CourierDefaults.BaseLatitude,
                    prefs.CourierDefaults.BaseLongitude,
                    prefs.CourierDefaults.BaseCity,
                    prefs.CourierDefaults.MaxConcurrentAssignments,
                    prefs.CourierDefaults.AvailableDaysOfWeek.ToList(),
                    prefs.CourierDefaults.AvailableFromHour,
                    prefs.CourierDefaults.AvailableToHour));
    }
}