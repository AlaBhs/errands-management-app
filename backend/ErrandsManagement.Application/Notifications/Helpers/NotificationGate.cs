using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.Notifications.Helpers;

/// <summary>
/// Two-level gate for notification delivery:
///   1. System policy — admin can silence a NotificationType for a role entirely.
///   2. User preference — user can opt out of types the system still allows.
/// A user can never re-enable a type the admin has disabled.
/// </summary>
public static class NotificationGate
{
    public static async Task<bool> IsAllowedAsync(
        Guid userId,
        UserRole recipientRole,
        NotificationType type,
        ISystemConfigReader configReader,
        IUserPreferencesRepository prefsRepo,
        CancellationToken ct)
    {
        // Gate 1: system policy
        var config = await configReader.GetAsync(ct);
        if (!config.NotificationPolicy.IsAllowed(type, recipientRole))
            return false;

        // Gate 2: user preference opt-out
        var prefs = await prefsRepo.GetByUserIdAsync(userId, ct);
        if (prefs is not null && prefs.DisabledNotificationTypes.Contains(type))
            return false;

        return true;
    }
}