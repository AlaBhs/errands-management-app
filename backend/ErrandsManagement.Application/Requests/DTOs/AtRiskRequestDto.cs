

namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record AtRiskRequestDto(
    Guid RequestId,
    string Title,
    DateTime Deadline,
    Guid RequesterId,
    Guid? AssignedCourierId);
}
