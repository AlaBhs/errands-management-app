using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Infrastructure.Persistence.Configurations;

public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> builder)
    {
        builder.Property(x => x.ActualCost)
               .HasPrecision(18, 2);
    }
}