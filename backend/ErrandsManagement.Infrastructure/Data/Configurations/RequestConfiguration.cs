using ErrandsManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class RequestConfiguration : IEntityTypeConfiguration<Request>
{
    public void Configure(EntityTypeBuilder<Request> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Description)
            .IsRequired();

        builder.Property(r => r.RequesterId)
            .IsRequired();

        builder.Property(r => r.Priority)
            .IsRequired();

        builder.Property(r => r.Status)
            .IsRequired();

        builder.Property(x => x.EstimatedCost)
               .HasPrecision(18, 2);

        builder.Property(r => r.Deadline);

        builder.Property(r => r.Category)
            .IsRequired();

        // Owned Value Object
        builder.OwnsOne(r => r.DeliveryAddress, address =>
        {
            address.Property(a => a.Street)
                .HasMaxLength(200)
                .IsRequired();

            address.Property(a => a.City)
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.PostalCode)
                .HasMaxLength(20)
                .IsRequired();

            address.Property(a => a.Country)
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.Note)
                .HasMaxLength(500);
        });
        builder
            .HasMany(r => r.Assignments)
            .WithOne()
            .HasForeignKey(a => a.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .Navigation(r => r.Assignments)
            .HasField("_assignments")
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder
            .HasMany(r => r.AuditLogs)
            .WithOne()
            .HasForeignKey(a => a.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .Navigation(r => r.AuditLogs)
            .HasField("_auditLogs")
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }

}