using Microsoft.AspNetCore.Identity;

namespace ErrandsManagement.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string? ProfilePhotoUrl { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? City { get; set; }
}