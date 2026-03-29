using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Infrastructure.FileStorage;
using ErrandsManagement.Infrastructure.Identity;
using ErrandsManagement.Infrastructure.Repositories;
using ErrandsManagement.Infrastructure.RealTime;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErrandsManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDatabase(configuration);
        services.AddIdentityConfiguration();
        services.AddRepositories();
        services.AddStorage();
        services.AddServices();

        return services;
    }

    private static IServiceCollection AddDatabase(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection")));

        return services;
    }

    private static IServiceCollection AddIdentityConfiguration(
        this IServiceCollection services)
    {
        services
            .AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        return services;
    }

    private static IServiceCollection AddRepositories(
        this IServiceCollection services)
    {
        services.AddScoped<IRequestRepository, RequestRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();

        return services;
    }

    private static IServiceCollection AddStorage(
    this IServiceCollection services)
    {
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        return services;
    }

    private static IServiceCollection AddServices(
    this IServiceCollection services)
    {
        services.AddScoped<INotificationRealtimeService, SignalRNotificationService>();
        return services;
    }

    
}