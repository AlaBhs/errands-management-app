namespace ErrandsManagement.Application.Interfaces;

/// <summary>
/// Defined in Application to keep handlers testable without Infrastructure.
/// Takes primitives only — no reference to ApplicationUser crosses the boundary.
/// </summary>
public interface IJwtTokenGenerator
{
    string GenerateAccessToken(Guid userId, string email, string fullName, IEnumerable<string> roles);
    string GenerateRefreshToken();
}