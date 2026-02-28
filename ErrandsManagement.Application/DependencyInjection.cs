using Microsoft.Extensions.DependencyInjection;

namespace ErrandsManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddScoped<
            Requests.Commands.CreateRequest.CreateRequestHandler>();

        return services;
    }
}