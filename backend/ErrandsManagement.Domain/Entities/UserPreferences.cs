using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;

namespace ErrandsManagement.Domain.Entities;

public sealed class UserPreferences : BaseEntity
{
    private UserPreferences() { }

    public Guid UserId { get; private set; }
    public string? Language { get; private set; }
    public string? Theme { get; private set; }
    public string? DefaultView { get; private set; }
    public HashSet<NotificationType> DisabledNotificationTypes { get; private set; } = new();
    public CollaboratorDefaults? CollaboratorDefaults { get; private set; }
    public CourierDefaults? CourierDefaults { get; private set; }

    public static UserPreferences CreateForUser(Guid userId)
    {
        return new UserPreferences
        {
            Id = Guid.NewGuid(),
            UserId = userId
        };
    }

    public void UpdateGeneralPreferences(string? language, string? theme, string? defaultView)
    {
        Language = language;
        Theme = theme;
        DefaultView = defaultView;
        MarkAsUpdated();
    }

    public void UpdateNotificationPreferences(HashSet<NotificationType> disabledTypes)
    {
        DisabledNotificationTypes = disabledTypes;
        MarkAsUpdated();
    }

    public void UpdateCollaboratorDefaults(CollaboratorDefaults defaults)
    {
        CollaboratorDefaults = defaults;
        MarkAsUpdated();
    }

    public void UpdateCourierDefaults(CourierDefaults defaults)
    {
        CourierDefaults = defaults;
        MarkAsUpdated();
    }
}