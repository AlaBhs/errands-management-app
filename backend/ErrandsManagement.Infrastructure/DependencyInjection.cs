using ErrandsManagement.Application.Common.Settings;
using ErrandsManagement.Application.CourierRecommendation.Interfaces;
using ErrandsManagement.Application.CourierRecommendation.Settings;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Infrastructure.AI;
using ErrandsManagement.Infrastructure.BackgroundJobs;
using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Infrastructure.Email;
using ErrandsManagement.Infrastructure.FileStorage;
using ErrandsManagement.Infrastructure.Identity;
using ErrandsManagement.Infrastructure.RealTime;
using ErrandsManagement.Infrastructure.Recommendation;
using ErrandsManagement.Infrastructure.Repositories;
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
        services.AddServices(configuration);
        services.AddSystemConfiguration(configuration);
        services.AddHostedService<DeadlineMonitoringService>();

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
                options.SignIn.RequireConfirmedEmail = true;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        // Email confirmation tokens expire after 24 hours
        services.Configure<DataProtectionTokenProviderOptions>(o =>
            o.TokenLifespan = TimeSpan.FromHours(24));

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
        services.AddScoped<IRequestMessageRepository, RequestMessageRepository>();
        services.AddScoped<ICourierRecommendationEngine, CourierRecommendationEngine>();
        services.AddScoped<IRequestTemplateRepository, RequestTemplateRepository>();
        services.AddScoped<IDeliveryBatchRepository, DeliveryBatchRepository>();
        services.AddScoped<IOperationalReportRepository, OperationalReportRepository>();
        services.AddScoped<IUserPreferencesRepository, UserPreferencesRepository>();
        services.AddScoped<SystemConfigurationRepository>();
        services.AddScoped<ISystemConfigurationRepository>(sp =>
            sp.GetRequiredService<SystemConfigurationRepository>());
        services.AddScoped<ISystemConfigReader>(sp =>
            sp.GetRequiredService<SystemConfigurationRepository>());

        return services;
    }

    private static IServiceCollection AddStorage(
        this IServiceCollection services)
    {
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        return services;
    }

    private static IServiceCollection AddServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<INotificationRealtimeService, SignalRNotificationService>();
        services.AddScoped<IRequestMessagingRealtimeService, SignalRRequestMessagingService>();

        services
            .AddOptions<EmailSettings>()
            .Bind(configuration.GetSection(EmailSettings.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddScoped<IEmailService, SmtpEmailService>();

        services.AddHttpClient<IOperationalAiService, GeminiOperationalAiService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(
                configuration.GetSection(GeminiSettings.SectionName)
                    .GetValue<int>("TimeoutSeconds", 30));
        });

        services
            .AddOptions<GeminiSettings>()
            .Bind(configuration.GetSection(GeminiSettings.SectionName))
            .ValidateOnStart();

        return services;
    }

    private static IServiceCollection AddSystemConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        return services;
    }

}