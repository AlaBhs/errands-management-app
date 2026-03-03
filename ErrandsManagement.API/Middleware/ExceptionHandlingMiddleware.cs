using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Domain.Common.Exceptions;
using System.Net;
using System.Text.Json;

namespace ErrandsManagement.API.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found.");

            await WriteResponse(
                context,
                HttpStatusCode.NotFound,
                ex.Message);
        }
        catch (DomainException ex)
        {
            _logger.LogWarning(ex, "Domain validation error.");

            await WriteResponse(
                context,
                HttpStatusCode.BadRequest,
                ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception.");

            await WriteResponse(
                context,
                HttpStatusCode.InternalServerError,
                "An unexpected error occurred.");
        }
    }

    private static async Task WriteResponse(
        HttpContext context,
        HttpStatusCode statusCode,
        string message)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            success = false,
            statusCode = (int)statusCode,
            error = message,
            traceId = context.TraceIdentifier
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response));
    }
}