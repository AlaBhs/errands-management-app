using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Common.Exceptions;
using MediatR;

namespace ErrandsManagement.Application.Users.Commands.ActivateUser;

public sealed class ActivateUserHandler : IRequestHandler<ActivateUserCommand>
{
    private readonly IUserRepository _userRepository;

    public ActivateUserHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task Handle(ActivateUserCommand request, CancellationToken ct)
    {
        var user = await _userRepository.FindByIdAsync(request.UserId, ct);

        if (user is null)
            throw new NotFoundException($"User {request.UserId} not found.");

        if (user.IsActive)
            throw new BusinessRuleException("User is already active.");

        await _userRepository.SetIsActiveAsync(request.UserId, true, ct);
    }
}