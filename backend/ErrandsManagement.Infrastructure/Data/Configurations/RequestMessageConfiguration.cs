using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class RequestMessageConfiguration : IEntityTypeConfiguration<RequestMessage>
{
    public void Configure(EntityTypeBuilder<RequestMessage> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.RequestId)
            .IsRequired();

        builder.Property(m => m.SenderId)
            .IsRequired();

        builder.Property(m => m.Content)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(m => m.CreatedAt)
            .IsRequired();

        // Messages are immutable — no UpdatedAt or IsDeleted tracking needed.

        // Relationship: each message belongs to one Request.
        // Cascade delete: removing a Request removes all its messages.
        builder.HasOne(m => m.Request)
            .WithMany()
            .HasForeignKey(m => m.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        // SenderId references AspNetUsers but we do NOT add a FK constraint here
        // to avoid cross-schema coupling between Domain entities and Identity.
        builder.Property(m => m.SenderId)
            .IsRequired();

        // Indexes for common access patterns
        builder.HasIndex(m => m.RequestId)
            .HasDatabaseName("IX_RequestMessages_RequestId");

        builder.HasIndex(m => new { m.RequestId, m.CreatedAt })
            .HasDatabaseName("IX_RequestMessages_RequestId_CreatedAt");
    }
}
