using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.SystemConfiguration.DTOs;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Queries.GetConfigurationChangeLog;

public sealed class GetConfigurationChangeLogHandler
    : IRequestHandler<GetConfigurationChangeLogQuery, PagedResult<ConfigurationChangeLogDto>>
{
    private readonly ISystemConfigurationRepository _repo;

    public GetConfigurationChangeLogHandler(ISystemConfigurationRepository repo)
    {
        _repo = repo;
    }

    public async Task<PagedResult<ConfigurationChangeLogDto>> Handle(
        GetConfigurationChangeLogQuery request, CancellationToken ct)
    {
        var logs = await _repo.GetChangeLogsPagedAsync(
            request.Section, request.Page, request.PageSize, ct);
        var total = await _repo.GetChangeLogsCountAsync(request.Section, ct);

        var dtos = logs.Select(l => new ConfigurationChangeLogDto(
            l.Id,
            l.ChangedAt,
            l.ChangedByUserId,
            l.Section,
            l.PreviousValueJson,
            l.NewValueJson)).ToList();

        return PagedResult<ConfigurationChangeLogDto>.Create(dtos, request.Page, request.PageSize, total);
    }
}