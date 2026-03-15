using ErrandsManagement.API.Common.Extensions;
using ErrandsManagement.API.Common.Middleware;
using ErrandsManagement.Application;
using ErrandsManagement.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddOpenApiDocumentation();
builder.Services.AddControllers();

var app = builder.Build();

await app.InitialiseDatabaseAsync();

app.UseOpenApiDocumentation();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseCors(CorsExtensions.PolicyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

