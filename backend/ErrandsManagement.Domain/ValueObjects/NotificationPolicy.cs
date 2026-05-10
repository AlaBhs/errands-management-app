using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Domain.ValueObjects;

public sealed record NotificationPolicy
{
    /// <summary>
    /// Maps NotificationType → set of UserRoles that should NOT receive it.
    /// Empty means everyone receives it.
    /// </summary>
    public Dictionary<NotificationType, HashSet<UserRole>> DisabledTypesByRole { get; init; } = new();

    public bool IsAllowed(NotificationType type, UserRole role)
    {
        if (DisabledTypesByRole.TryGetValue(type, out var disabledRoles))
            return !disabledRoles.Contains(role);
        return true;
    }
}