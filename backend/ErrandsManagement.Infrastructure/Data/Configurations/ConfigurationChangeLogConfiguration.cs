using ErrandsManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class ConfigurationChangeLogConfiguration
    : IEntityTypeConfiguration<ConfigurationChangeLog>
{
    public void Configure(EntityTypeBuilder<ConfigurationChangeLog> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.ChangedAt).IsRequired();
        builder.Property(l => l.ChangedByUserId).IsRequired();

        builder.Property(l => l.Section)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.PreviousValueJson).IsRequired();
        builder.Property(l => l.NewValueJson).IsRequired();

        // No soft-delete, no update — append-only
        builder.HasIndex(l => l.ChangedAt);
        builder.HasIndex(l => l.Section);
    }
}