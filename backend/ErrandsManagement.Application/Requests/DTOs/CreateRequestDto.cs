using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record CreateRequestDto(
        string Title,
        string Description,
        AddressDto DeliveryAddress,
        PriorityLevel Priority,
        DateTime? Deadline,
        decimal? EstimatedCost
    );
}
