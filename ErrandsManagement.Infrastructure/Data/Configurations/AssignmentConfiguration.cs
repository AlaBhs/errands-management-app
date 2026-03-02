using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Infrastructure.Persistence.Configurations;

public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
       .ValueGeneratedNever();

        builder.Property(a => a.RequestId)
               .IsRequired();

        builder.Property(a => a.CourierId)
               .IsRequired();

        builder.Property(a => a.ActualCost)
               .HasPrecision(18, 2);
    }
}