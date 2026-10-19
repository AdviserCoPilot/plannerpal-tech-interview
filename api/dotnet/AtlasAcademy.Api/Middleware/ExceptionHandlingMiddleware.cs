using System.Text.Json;
using AtlasAcademy.Api.Exceptions;

namespace AtlasAcademy.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (NotFoundException ex)
        {
            await WriteError(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (ConflictException ex)
        {
            await WriteError(context, StatusCodes.Status409Conflict, ex.Message);
        }
        catch (ValidationException ex)
        {
            await WriteError(context, StatusCodes.Status400BadRequest, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            await WriteError(context, StatusCodes.Status500InternalServerError, "Internal server error");
        }
    }

    private static Task WriteError(HttpContext context, int status, string message)
    {
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        var payload = JsonSerializer.Serialize(new { error = message });
        return context.Response.WriteAsync(payload);
    }
}
