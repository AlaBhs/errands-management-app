using ErrandsManagement.Domain.Enums;
using MediatR;

namespace ErrandsManagement.Application.SystemConfiguration.Commands.UpdateRequestPolicy;

public sealed record UpdateRequestPolicyCommand(
    Guid ChangedBy,
    HashSet<RequestCategory> EnabledCategories,
    bool IsContactPersonRequired,
    int MinDeadlineAdvanceHours) : IRequest<Unit>;