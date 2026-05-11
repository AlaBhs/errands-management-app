using ErrandsManagement.Domain.Enums;
using MediatR;

namespace ErrandsManagement.Application.UserPreferences.Commands.UpdateCollaboratorDefaults;

public sealed record UpdateCollaboratorDefaultsCommand(
    Guid UserId,
    RequestCategory? DefaultCategory,
    PriorityLevel? DefaultPriority,
    string? DefaultContactPerson,
    string? DefaultContactPhone) : IRequest<Unit>;