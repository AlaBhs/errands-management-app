using ErrandsManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class UserPreferencesConfiguration
    : IEntityTypeConfiguration<UserPreferences>
{
    public void Configure(EntityTypeBuilder<UserPreferences> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.UserId).IsRequired();
        builder.HasIndex(p => p.UserId).IsUnique();

        builder.Property(p => p.Language).HasMaxLength(10);
        builder.Property(p => p.Theme).HasMaxLength(20);
        builder.Property(p => p.DefaultView).HasMaxLength(20);

        // Store as JSON column
        builder.Property(p => p.DisabledNotificationTypes)
            .HasColumnType("nvarchar(max)")
            .HasConversion(
                v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                v => System.Text.Json.JsonSerializer.Deserialize<HashSet<Domain.Enums.NotificationType>>(v,
                         (System.Text.Json.JsonSerializerOptions?)null)
                     ?? new HashSet<Domain.Enums.NotificationType>());

        builder.OwnsOne(p => p.CollaboratorDefaults, cd => cd.ToJson());
        builder.OwnsOne(p => p.CourierDefaults, cd => cd.ToJson());
    }
}