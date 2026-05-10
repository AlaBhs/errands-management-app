using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Application.Interfaces;

public interface ISystemConfigReader
{
    Task<SystemConfiguration> GetAsync(CancellationToken ct = default);
}