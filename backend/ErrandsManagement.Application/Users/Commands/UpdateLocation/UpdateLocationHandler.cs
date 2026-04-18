using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Users.Commands.UpdateLocation;

public sealed class UpdateLocationHandler : IRequestHandler<UpdateLocationCommand>
{
    private readonly IUserRepository _userRepository;

    public UpdateLocationHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task Handle(UpdateLocationCommand command, CancellationToken cancellationToken)
    {
        var user = await _userRepository.FindByIdAsync(command.UserId, cancellationToken);

        if (user is null)
            throw new NotFoundException("User not found.");

        var location = new UpdateLocationDto(command.Latitude, command.Longitude, command.City);
        await _userRepository.UpdateLocationAsync(location, cancellationToken);
    }
}