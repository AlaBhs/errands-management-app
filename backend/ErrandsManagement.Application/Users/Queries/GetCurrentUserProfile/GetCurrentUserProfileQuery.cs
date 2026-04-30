using ErrandsManagement.Application.Users.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Users.Queries.GetCurrentUserProfile;

public sealed record GetCurrentUserProfileQuery(Guid UserId) : IRequest<ProfileDto>;