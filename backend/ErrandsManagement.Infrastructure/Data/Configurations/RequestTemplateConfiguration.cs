using ErrandsManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class RequestTemplateConfiguration : IEntityTypeConfiguration<RequestTemplate>
{
    public void Configure(EntityTypeBuilder<RequestTemplate> builder)
    {
        builder.ToTable("RequestTemplates");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Description)
            .IsRequired();

        builder.Property(t => t.Category)
            .IsRequired();

        builder.Property(t => t.EstimatedCost)
            .HasPrecision(18, 2);

        builder.Property(t => t.CreatedBy)
            .IsRequired();

        // Unique composite index: name must be unique per user
        builder.HasIndex(t => new { t.CreatedBy, t.Name })
            .IsUnique();

        // Address owned value object — same pattern as RequestConfiguration
        builder.OwnsOne(t => t.Address, address =>
        {
            address.Property(a => a.Street).HasMaxLength(200);
            address.Property(a => a.City).HasMaxLength(100).IsRequired();
            address.Property(a => a.PostalCode).HasMaxLength(20).IsRequired();
            address.Property(a => a.Country).HasMaxLength(100).IsRequired();
            address.Property(a => a.Note).HasMaxLength(500);
            address.Property(a => a.Latitude);
            address.Property(a => a.Longitude);
        });
    }
}