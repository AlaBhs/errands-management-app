using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Entities;
using MediatR;

namespace ErrandsManagement.Application.Users.Commands.DeactivateUser;

public sealed class DeactivateUserHandler : IRequestHandler<DeactivateUserCommand>
{
    private readonly IUserRepository _userRepository;

    public DeactivateUserHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task Handle(DeactivateUserCommand request, CancellationToken ct)
    {
        if (request.UserId == request.RequestingUserId)
            throw new DomainException("You cannot deactivate your own account.");

        var user = await _userRepository.FindByIdAsync(request.UserId, ct);

        if (user is null)
            throw new NotFoundException($"User {request.UserId} not found.");

        if (!user.IsActive)
            throw new DomainException("User is already inactive.");

        await _userRepository.SetIsActiveAsync(request.UserId, false, ct);
    }
}