

namespace ErrandsManagement.Application.OperationalReports.DTOs
{
    public sealed record OperationalReportSummaryDto(
    Guid Id,
    DateTime GeneratedAt,
    DateTime PeriodFrom,
    DateTime PeriodTo,
    bool AiUnavailable
);
}
