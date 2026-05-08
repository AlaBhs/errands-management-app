namespace ErrandsManagement.Application.OperationalReports.DTOs;

public sealed record OperationalReportDto(
    Guid Id,
    DateTime GeneratedAt,
    DateTime PeriodFrom,
    DateTime PeriodTo,
    string MetricsSnapshot,
    string? AiAnalysis,
    bool AiUnavailable,
    Guid GeneratedByUserId
);
