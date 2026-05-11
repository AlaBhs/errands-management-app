using ErrandsManagement.Domain.Enums;
using MediatR;

namespace ErrandsManagement.Application.UserPreferences.Commands.UpdateNotificationPreferences;

public sealed record UpdateNotificationPreferencesCommand(
    Guid UserId,
    HashSet<NotificationType> DisabledTypes) : IRequest<Unit>;