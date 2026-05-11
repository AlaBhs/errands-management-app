using System.Text.Json;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class UserPreferencesConfiguration
    : IEntityTypeConfiguration<UserPreferences>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = false
    };

    public void Configure(EntityTypeBuilder<UserPreferences> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.UserId).IsRequired();
        builder.HasIndex(p => p.UserId).IsUnique();

        builder.Property(p => p.Language).HasMaxLength(10);
        builder.Property(p => p.Theme).HasMaxLength(20);
        builder.Property(p => p.DefaultView).HasMaxLength(20);

        builder.Property(p => p.DisabledNotificationTypes)
            .HasColumnName("DisabledNotificationTypes")
            .HasColumnType("nvarchar(max)")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<HashSet<Domain.Enums.NotificationType>>(v, JsonOptions)
                     ?? new HashSet<Domain.Enums.NotificationType>())
            .IsRequired();

        builder.Property(p => p.CollaboratorDefaults)
            .HasColumnName("CollaboratorDefaults")
            .HasColumnType("nvarchar(max)")
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, JsonOptions),
                v => v == null ? null : JsonSerializer.Deserialize<CollaboratorDefaults>(v, JsonOptions));

        builder.Property(p => p.CourierDefaults)
            .HasColumnName("CourierDefaults")
            .HasColumnType("nvarchar(max)")
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, JsonOptions),
                v => v == null ? null : JsonSerializer.Deserialize<CourierDefaults>(v, JsonOptions));
    }
}