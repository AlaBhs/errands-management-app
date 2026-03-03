using ErrandsManagement.Application.Requests.Commands.AssignRequest;
using ErrandsManagement.Application.Requests.Commands.CancelRequest;
using ErrandsManagement.Application.Requests.Commands.CompleteRequest;
using ErrandsManagement.Application.Requests.Commands.CreateRequest;
using ErrandsManagement.Application.Requests.Commands.StartRequest;
using ErrandsManagement.Application.Requests.Commands.SubmitSurvey;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
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
        services.AddScoped<GetAllRequestsHandler>();
        services.AddScoped<AssignRequestHandler>();
        services.AddScoped<StartRequestHandler>();
        services.AddScoped<CompleteRequestHandler>();
        services.AddScoped<CancelRequestHandler>();
        services.AddScoped<SubmitSurveyHandler>();




        return services;
    }
}