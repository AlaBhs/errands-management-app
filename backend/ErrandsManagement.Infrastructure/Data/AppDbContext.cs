using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ErrandsManagement.Infrastructure.Data;

public sealed class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<Request> Requests => Set<Request>();

    public DbSet<Notification> Notifications => Set<Notification>();

    public DbSet<RequestMessage> RequestMessages => Set<RequestMessage>();

    public DbSet<RequestTemplate> RequestTemplates => Set<RequestTemplate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(AppDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.LogTo(Console.WriteLine, LogLevel.Warning);
    }
}