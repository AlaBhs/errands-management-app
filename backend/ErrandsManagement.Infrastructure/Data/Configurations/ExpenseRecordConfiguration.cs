using ErrandsManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class ExpenseRecordConfiguration : IEntityTypeConfiguration<ExpenseRecord>
{
    public void Configure(EntityTypeBuilder<ExpenseRecord> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
               .ValueGeneratedNever();

        builder.Property(e => e.RequestId)
               .IsRequired();

        builder.Property(e => e.AssignmentId)
               .IsRequired();

        builder.Property(e => e.Category)
               .IsRequired();

        builder.Property(e => e.Amount)
               .IsRequired()
               .HasPrecision(18, 2);

        builder.Property(e => e.CreatedBy)
               .IsRequired()
               .HasMaxLength(256);

        builder.Property(e => e.Description)
               .HasMaxLength(500);

        // Index for performant SUM queries per request
        builder.HasIndex(e => e.RequestId);
    }
}