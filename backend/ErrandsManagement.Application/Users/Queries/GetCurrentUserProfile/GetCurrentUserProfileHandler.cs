using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Users.Queries.GetCurrentUserProfile;

public sealed class GetCurrentUserProfileHandler
    : IRequestHandler<GetCurrentUserProfileQuery, ProfileDto>
{
    private readonly IUserRepository _users;

    public GetCurrentUserProfileHandler(IUserRepository users) => _users = users;

    public async Task<ProfileDto> Handle(
        GetCurrentUserProfileQuery request, CancellationToken ct)
    {
        var item = await _users.FindListItemByIdAsync(request.UserId, ct)
            ?? throw new NotFoundException($"User {request.UserId} not found.");

        var appUser = await _users.GetApplicationUserAsync(request.UserId, ct);

        return new ProfileDto(
            item.Id,
            item.FullName,
            item.Email,
            item.Role,
            item.IsActive,
            appUser?.ProfilePhotoUrl,
            item.CreatedAt);
    }
}