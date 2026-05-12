using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public NotificationType Type { get; private set; }
    public Guid? ReferenceId { get; private set; }
    public bool IsRead { get; private set; }

    public string? Metadata { get; init; }

    // EF Core constructor
    private Notification() { }

    public static Notification Create(
        Guid userId,
        string message,
        NotificationType type,
        Guid? referenceId = null,
        string? metadata = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        return new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Message = message,
            Type = type,
            ReferenceId = referenceId,
            Metadata = metadata,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void MarkAsRead()
    {
        IsRead = true;
    }
}