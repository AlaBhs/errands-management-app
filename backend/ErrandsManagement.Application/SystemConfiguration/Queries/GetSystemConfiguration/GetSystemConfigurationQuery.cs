using ErrandsManagement.Application.SystemConfiguration.DTOs;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Queries.GetSystemConfiguration;

public sealed record GetSystemConfigurationQuery : IRequest<SystemConfigurationDto>;