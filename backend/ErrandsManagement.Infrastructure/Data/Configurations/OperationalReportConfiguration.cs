using ErrandsManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class OperationalReportConfiguration : IEntityTypeConfiguration<OperationalReport>
{
    public void Configure(EntityTypeBuilder<OperationalReport> builder)
    {
        builder.ToTable("OperationalReports");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.MetricsSnapshot).IsRequired().HasColumnType("nvarchar(max)");
        builder.Property(r => r.AiAnalysis).HasColumnType("nvarchar(max)");
        builder.Property(r => r.GeneratedAt).IsRequired();
        builder.Property(r => r.PeriodFrom).IsRequired();
        builder.Property(r => r.PeriodTo).IsRequired();
        builder.Property(r => r.GeneratedByUserId).IsRequired();
        // Index for idempotency check
        builder.HasIndex(r => r.GeneratedAt);
    }
}
