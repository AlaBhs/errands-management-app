namespace ErrandsManagement.Domain.ValueObjects;

public sealed class Address : IEquatable<Address>
{
    public string Street { get; }
    public string City { get; }
    public string PostalCode { get; }
    public string Country { get; }
    public string? Note { get; }

    public Address(
        string street,
        string city,
        string postalCode,
        string country,
        string? note = null)
    {
        Street = street;
        City = city;
        PostalCode = postalCode;
        Country = country;
        Note = note;
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
            && Note == other.Note;
    }

    public override int GetHashCode()
        => HashCode.Combine(Street, City, PostalCode, Country, Note);
}