using ErrandsManagement.Application.SystemConfiguration.DTOs;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Queries.GetPublicConfig;

public sealed record GetPublicConfigQuery : IRequest<PublicConfigDto>;