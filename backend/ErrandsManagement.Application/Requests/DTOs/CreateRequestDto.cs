using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record CreateRequestDto(
        string Title,
        string Description,
        AddressDto DeliveryAddress,
        PriorityLevel Priority,
        RequestCategory Category,
        string? ContactPerson,
        string? ContactPhone,
        string? Comment,
        DateTime? Deadline,
        decimal? EstimatedCost
    );
}
