using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class DeliveryBatchConfiguration
    : IEntityTypeConfiguration<DeliveryBatch>
{
    public void Configure(EntityTypeBuilder<DeliveryBatch> builder)
    {
        builder.ToTable("DeliveryBatches");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.ClientName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.ClientPhone)
            .HasMaxLength(50);

        builder.Property(x => x.PickupNote)
            .HasMaxLength(1000);

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.PickedUpBy)
            .HasMaxLength(200);

        builder.Property(x => x.CancelReason)
            .HasMaxLength(500);

        builder
            .HasMany(b => b.Attachments)
            .WithOne()
            .HasForeignKey(a => a.DeliveryBatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .Navigation(b => b.Attachments)
            .HasField("_attachments")
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        // Indexes for common query patterns
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CreatedAt);
    }
}