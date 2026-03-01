using ErrandsManagement.Application.Requests.Commands.CreateRequest;
using ErrandsManagement.Application.Requests.Queries.GetRequestById;
using Microsoft.Extensions.DependencyInjection;

namespace ErrandsManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddScoped<CreateRequestHandler>();
        services.AddScoped<GetRequestByIdHandler>();

        return services;
    }
}