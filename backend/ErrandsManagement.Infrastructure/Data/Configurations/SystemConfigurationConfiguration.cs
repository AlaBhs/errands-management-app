using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErrandsManagement.Infrastructure.Data.Configurations;

public sealed class SystemConfigurationConfiguration
    : IEntityTypeConfiguration<SystemConfiguration>
{
    public void Configure(EntityTypeBuilder<SystemConfiguration> builder)
    {
        builder.HasKey(s => s.Id);

        builder.OwnsOne(s => s.RecommendationPolicy, rp =>
        {
            rp.ToJson();
            rp.OwnsOne(r => r.NormalPriorityWeights);
            rp.OwnsOne(r => r.UrgentPriorityWeights);
        });

        builder.OwnsOne(s => s.SlaPolicy, sp => sp.ToJson());

        builder.OwnsOne(s => s.ExpensePolicy, ep => ep.ToJson());

        builder.OwnsOne(s => s.NotificationPolicy, np => np.ToJson());

        builder.OwnsOne(s => s.RequestPolicy, rp => rp.ToJson());
    }
}