using ErrandsManagement.Domain.Enums;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateExpensePolicy;

public sealed record UpdateExpensePolicyCommand(
    Guid ChangedBy,
    Dictionary<RequestCategory, decimal> CategoryBudgetCaps,
    int OverrunFlagThresholdPercent) : IRequest<Unit>;