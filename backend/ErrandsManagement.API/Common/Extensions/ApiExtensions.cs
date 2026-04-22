using ErrandsManagement.API.Hubs;
using ErrandsManagement.Application.Interfaces;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ErrandsManagement.API.Common.Extensions;

/// <summary>
/// Ensures every DateTime serialized to JSON carries a "Z" suffix,
/// preventing the browser from misinterpreting UTC timestamps as local time.
/// </summary>
internal sealed class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetDateTime();
        // Always treat incoming datetimes as UTC
        return DateTime.SpecifyKind(value, DateTimeKind.Utc);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        // Force Utc kind so the serializer appends "Z"
        writer.WriteStringValue(DateTime.SpecifyKind(value, DateTimeKind.Utc));
    }
}

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

                // Ensure all DateTime values are serialized with a "Z" (UTC) suffix.
                // Without this, SQL Server returns DateTimeKind.Unspecified and the
                // browser parses the timestamp as local time, causing "1 hour ago" bugs.
                options.JsonSerializerOptions.Converters.Add(
                    new UtcDateTimeConverter());
            });

        services.AddScoped<INotificationHubProxy, SignalRHubProxy>();

        services.AddScoped<IRequestMessagingHubProxy, RequestMessagingHubProxy>();

        return services;
    }
}