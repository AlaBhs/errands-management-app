using ErrandsManagement.API.Common.Extensions;
using ErrandsManagement.API.Common.Middleware;
using ErrandsManagement.Application;
using ErrandsManagement.Infrastructure;
using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Infrastructure.Data.Seed;
using ErrandsManagement.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddOpenApiDocumentation();
builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    DbInitializer.Seed(db);
    await IdentitySeeder.SeedAsync(scope.ServiceProvider);
}

app.UseOpenApiDocumentation();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseCors(CorsExtensions.PolicyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

