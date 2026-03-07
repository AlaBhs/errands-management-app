

namespace ErrandsManagement.Application.DTOs
{
    public sealed record AuditLogDto(
        string EventType,
        string Detail,
        DateTime OccurredAt);
}
