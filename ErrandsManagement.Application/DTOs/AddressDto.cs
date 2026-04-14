
namespace ErrandsManagement.Application.DTOs
{
    public sealed record AddressDto(
        string Street,
        string City,
        string PostalCode,
        string Country,
        string? Note);
}
