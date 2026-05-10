using ErrandsManagement.Domain.Enums;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateNotificationPolicy;

public sealed record UpdateNotificationPolicyCommand(
    Guid ChangedBy,
    Dictionary<NotificationType, HashSet<UserRole>> DisabledTypesByRole) : IRequest<Unit>;