using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Domain.ValueObjects;

public sealed record RequestPolicy
{
    public HashSet<RequestCategory> EnabledCategories { get; init; } =
        new(Enum.GetValues<RequestCategory>());

    public bool IsContactPersonRequired { get; init; } = false;
    public int MinDeadlineAdvanceHours { get; init; } = 24;
}