using ErrandsManagement.Application.UserPreferences.DTOs;
using MediatR;

namespace ErrandsManagement.Application.UserPreferences.Queries.GetMyPreferences;

public sealed record GetMyPreferencesQuery(Guid UserId) : IRequest<UserPreferencesDto>;