using ErrandsManagement.Domain.Common;

public sealed class OperationalReport : BaseEntity
{
#pragma warning disable CS8618
    private OperationalReport() { } // EF Core constructor
#pragma warning restore CS8618

    public DateTime GeneratedAt { get; private set; }
    public DateTime PeriodFrom { get; private set; }
    public DateTime PeriodTo { get; private set; }
    public string MetricsSnapshot { get; private set; }   // JSON blob
    public string? AiAnalysis { get; private set; }       // JSON blob, nullable
    public bool AiUnavailable { get; private set; }
    public Guid GeneratedByUserId { get; private set; }

    public OperationalReport(
        DateTime generatedAt, DateTime periodFrom, DateTime periodTo,
        string metricsSnapshot, string? aiAnalysis,
        bool aiUnavailable, Guid generatedByUserId)
    {
        GeneratedAt = generatedAt;
        PeriodFrom = periodFrom;
        PeriodTo = periodTo;
        MetricsSnapshot = metricsSnapshot;
        AiAnalysis = aiAnalysis;
        AiUnavailable = aiUnavailable;
        GeneratedByUserId = generatedByUserId;
    }
    // No update methods — fully immutable after creation
}