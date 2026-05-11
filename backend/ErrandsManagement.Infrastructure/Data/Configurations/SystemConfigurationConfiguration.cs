using System.Text.Json;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class SystemConfigurationConfiguration
    : IEntityTypeConfiguration<SystemConfiguration>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = false
    };

    public void Configure(EntityTypeBuilder<SystemConfiguration> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.RecommendationPolicy)
            .HasColumnName("RecommendationPolicy")
            .HasColumnType("nvarchar(max)")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<RecommendationPolicy>(v, JsonOptions)
                     ?? new RecommendationPolicy())
            .IsRequired();

        builder.Property(s => s.SlaPolicy)
            .HasColumnName("SlaPolicy")
            .HasColumnType("nvarchar(max)")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<SlaPolicy>(v, JsonOptions)
                     ?? new SlaPolicy())
            .IsRequired();

        builder.Property(s => s.ExpensePolicy)
            .HasColumnName("ExpensePolicy")
            .HasColumnType("nvarchar(max)")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<ExpensePolicy>(v, JsonOptions)
                     ?? new ExpensePolicy())
            .IsRequired();

        builder.Property(s => s.NotificationPolicy)
            .HasColumnName("NotificationPolicy")
            .HasColumnType("nvarchar(max)")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<NotificationPolicy>(v, JsonOptions)
                     ?? new NotificationPolicy())
            .IsRequired();

        builder.Property(s => s.RequestPolicy)
            .HasColumnName("RequestPolicy")
            .HasColumnType("nvarchar(max)")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => JsonSerializer.Deserialize<RequestPolicy>(v, JsonOptions)
                     ?? new RequestPolicy())
            .IsRequired();
    }
}