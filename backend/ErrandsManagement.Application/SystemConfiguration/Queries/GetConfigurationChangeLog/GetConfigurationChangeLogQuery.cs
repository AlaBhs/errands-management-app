using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.SystemConfiguration.DTOs;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Queries.GetConfigurationChangeLog;

public sealed record GetConfigurationChangeLogQuery(
    string? Section,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ConfigurationChangeLogDto>>;