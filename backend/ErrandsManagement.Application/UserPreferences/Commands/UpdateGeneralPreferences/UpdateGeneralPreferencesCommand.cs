using MediatR;

namespace ErrandsManagement.Application.UserPreferences.Commands.UpdateGeneralPreferences;

public sealed record UpdateGeneralPreferencesCommand(
    Guid UserId,
    string? Language,
    string? Theme,
    string? DefaultView) : IRequest<Unit>;