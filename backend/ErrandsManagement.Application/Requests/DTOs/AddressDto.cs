namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record AddressDto( 
        string City,
        string PostalCode,
        string Country,
        string? Street = null,
        string? Note = null,
        double? Latitude = null,
        double? Longitude = null);
}