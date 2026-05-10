using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Domain.ValueObjects;

public sealed record CollaboratorDefaults
{
    public RequestCategory? DefaultCategory { get; init; }
    public PriorityLevel? DefaultPriority { get; init; }
    public string? DefaultContactPerson { get; init; }
    public string? DefaultContactPhone { get; init; }
}