namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record AddressDto(
        string Street,
        string City,
        string PostalCode,
        string Country,
        string? Note = null,
        double? Latitude = null,
        double? Longitude = null);
}