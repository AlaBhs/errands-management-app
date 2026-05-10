using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.SystemConfiguration.DTOs;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Queries.GetPublicConfig;

public sealed class GetPublicConfigHandler : IRequestHandler<GetPublicConfigQuery, PublicConfigDto>
{
    private readonly ISystemConfigReader _reader;

    public GetPublicConfigHandler(ISystemConfigReader reader)
    {
        _reader = reader;
    }

    public async Task<PublicConfigDto> Handle(GetPublicConfigQuery request, CancellationToken ct)
    {
        var config = await _reader.GetAsync(ct);

        return new PublicConfigDto(
            EnabledCategories: config.RequestPolicy.EnabledCategories.ToList(),
            MinDeadlineAdvanceHours: config.RequestPolicy.MinDeadlineAdvanceHours,
            CategoryBudgetCaps: config.ExpensePolicy.CategoryBudgetCaps);
    }
}