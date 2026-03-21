using ErrandsManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configuration;

public sealed class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
               .ValueGeneratedNever();

        builder.Property(a => a.RequestId)
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
    }
}