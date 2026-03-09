using ErrandsManagement.API.Common.Middleware;
using ErrandsManagement.Application;
using ErrandsManagement.Application.Common.Behaviors;
using ErrandsManagement.Application.Requests.Commands.CreateRequest;
using ErrandsManagement.Infrastructure;
using ErrandsManagement.Infrastructure.Data;
using ErrandsManagement.Infrastructure.Data.Seed;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(
        typeof(CreateRequestCommand).Assembly));

builder.Services.AddValidatorsFromAssembly(
    typeof(CreateRequestCommand).Assembly);

builder.Services.AddTransient(
    typeof(IPipelineBehavior<,>),
    typeof(ValidationBehavior<,>));

// Controller
builder.Services.AddControllers();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Apply migrations
    db.Database.Migrate();

    // Seed data (only if empty)
    DbInitializer.Seed(db);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.MapControllers();

app.UseCors("Frontend"); 

app.Run();

