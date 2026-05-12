using ErrandsManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class DeliveryBatchAttachmentConfiguration
    : IEntityTypeConfiguration<DeliveryBatchAttachment>
{
    public void Configure(EntityTypeBuilder<DeliveryBatchAttachment> builder)
    {
        builder.ToTable("DeliveryBatchAttachments");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
               .ValueGeneratedNever();

        builder.Property(a => a.DeliveryBatchId)
               .IsRequired();

        builder.Property(a => a.FileName)
               .IsRequired()
               .HasMaxLength(255);

        builder.Property(a => a.ContentType)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(a => a.Uri)
               .IsRequired()
               .HasMaxLength(1000);

        builder.Property(a => a.UploadedAt)
               .IsRequired();

        builder.HasIndex(a => a.DeliveryBatchId);
    }
}