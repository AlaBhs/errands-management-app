using ErrandsManagement.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(u => u.FullName)
                  .IsRequired()
                  .HasMaxLength(50);

        builder.Property(u => u.ProfilePhotoUrl)
                  .HasMaxLength(500);

        builder.Property(u => u.City)
                  .HasMaxLength(100);

        builder.Property(u => u.Latitude);

        builder.Property(u => u.Longitude);
    }
}