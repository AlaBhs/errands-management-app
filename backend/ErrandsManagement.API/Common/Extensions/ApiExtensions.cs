using System.Text.Json.Serialization;

namespace ErrandsManagement.API.Common.Extensions;

public static class ApiExtensions
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services)
    {
        services
            .AddControllers()
            .AddJsonOptions(options =>
            {
                // Accept and return enum names as strings instead of integers
                // e.g. "Pending" instead of 0, "OfficeSupplies" instead of 4
                options.JsonSerializerOptions.Converters.Add(
                    new JsonStringEnumConverter());
            });

        return services;
    }
}