using MediatR;

namespace ErrandsManagement.Application.Users.Commands.UpdateProfile;

public sealed record UpdateProfileCommand(
    Guid UserId,
    string FullName) : IRequest;