using ErrandsManagement.Domain.Entities;
using SystemConfigurationEntity = ErrandsManagement.Domain.Entities.SystemConfiguration;
namespace ErrandsManagement.Application.Interfaces;

public interface ISystemConfigurationRepository
{
    Task<SystemConfigurationEntity> GetAsync(CancellationToken ct = default);
    Task UpdateAsync(SystemConfigurationEntity config, CancellationToken ct = default);
    Task AddChangeLogAsync(ConfigurationChangeLog log, CancellationToken ct = default);
    Task<List<ConfigurationChangeLog>> GetChangeLogsPagedAsync(
        string? section, int page, int pageSize, CancellationToken ct = default);
    Task<int> GetChangeLogsCountAsync(string? section, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}