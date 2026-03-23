using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Domain.Common.Exceptions;
using FluentValidation;
using System.Text.Json;

namespace ErrandsManagement.API.Common.Middleware;

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
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed.");

            var errors = ex.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            await WriteErrorResponse(
                context,
                errors,
                StatusCodes.Status400BadRequest);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found.");

            await WriteErrorResponse(
                context,
                new { message = ex.Message },
                StatusCodes.Status404NotFound);
        }
        catch (DomainException ex)
        {
            _logger.LogWarning(ex, "Domain rule violation.");

            await WriteErrorResponse(
                context,
                new { message = ex.Message },
                StatusCodes.Status400BadRequest);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access.");
            await WriteErrorResponse(
                context,
                new { message = ex.Message },
                StatusCodes.Status401Unauthorized);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation.");
            await WriteErrorResponse(
                context,
                new { message = ex.Message },
                StatusCodes.Status400BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception.");

            await WriteErrorResponse(
                context,
                new { message = "An unexpected error occurred." },
                StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task WriteErrorResponse(
        HttpContext context,
        object errors,
        int statusCode)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = ApiResponse<object>.FailureResponse(
            errors,
            statusCode,
            context.TraceIdentifier);

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response));
    }
}