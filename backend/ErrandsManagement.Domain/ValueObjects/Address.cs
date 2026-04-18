namespace ErrandsManagement.Domain.ValueObjects;

public sealed class Address : IEquatable<Address>
{
    public string Street { get; }
    public string City { get; }
    public string PostalCode { get; }
    public string Country { get; }
    public string? Note { get; }
    public double? Latitude { get; }
    public double? Longitude { get; }

#pragma warning disable CS8618 // EF Core private parameterless constructor
    private Address() { }
#pragma warning restore CS8618

    public Address(
        string street,
        string city,
        string postalCode,
        string country,
        string? note = null,
        double? latitude = null,
        double? longitude = null)
    {
        Street = street;
        City = city;
        PostalCode = postalCode;
        Country = country;
        Note = note;
        Latitude = latitude;
        Longitude = longitude;
    }

    public override bool Equals(object? obj)
        => Equals(obj as Address);

    public bool Equals(Address? other)
    {
        if (other is null) return false;

        return Street == other.Street
            && City == other.City
            && PostalCode == other.PostalCode
            && Country == other.Country
            && Note == other.Note
            && Latitude == other.Latitude
            && Longitude == other.Longitude;
    }

    public override int GetHashCode()
        => HashCode.Combine(Street, City, PostalCode, Country, Note, Latitude, Longitude);
}