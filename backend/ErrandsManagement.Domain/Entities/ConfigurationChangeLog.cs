namespace ErrandsManagement.Domain.Entities;

public sealed class ConfigurationChangeLog
{
    private ConfigurationChangeLog() { }

    public Guid Id { get; private set; }
    public DateTime ChangedAt { get; private set; }
    public Guid ChangedByUserId { get; private set; }
    public string Section { get; private set; } = default!;
    public string PreviousValueJson { get; private set; } = default!;
    public string NewValueJson { get; private set; } = default!;

    public static ConfigurationChangeLog Create(
        Guid changedByUserId,
        string section,
        string previousValueJson,
        string newValueJson)
    {
        return new ConfigurationChangeLog
        {
            Id = Guid.NewGuid(),
            ChangedAt = DateTime.UtcNow,
            ChangedByUserId = changedByUserId,
            Section = section,
            PreviousValueJson = previousValueJson,
            NewValueJson = newValueJson
        };
    }
}