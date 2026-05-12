using ErrandsManagement.API.Common.Extensions;
using ErrandsManagement.API.Common.Middleware;
using ErrandsManagement.API.Extensions;
using ErrandsManagement.API.Hubs;
using ErrandsManagement.Application;
using ErrandsManagement.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddOpenApiDocumentation();
builder.Services.AddApiServices(builder.Configuration);
builder.Services.AddSignalR();

var app = builder.Build();

await app.InitialiseDatabaseAsync();

app.UseOpenApiDocumentation();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.EnsureWebRootExists();
app.UseStaticFiles();
app.UseCors(CorsExtensions.PolicyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<RequestMessagingHub>("/hubs/request-messaging");

app.Run();

