using SystemConfigurationEntity = ErrandsManagement.Domain.Entities.SystemConfiguration;

namespace ErrandsManagement.Application.Interfaces;

public interface ISystemConfigReader
{
    Task<SystemConfigurationEntity> GetAsync(CancellationToken ct = default);
}