using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.DTOs;
using ErrandsManagement.Domain.Entities;
using MediatR;
using System.Collections;
using System.Data;

namespace ErrandsManagement.Application.Users.Queries.GetUserById;

public sealed class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, UserListItemDto>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserListItemDto> Handle(GetUserByIdQuery request, CancellationToken ct)
    {
        var user = await _userRepository.FindListItemByIdAsync(request.UserId, ct);

        if (user is null)
            throw new NotFoundException($"User {request.UserId} not found.");

        return user;
    }
}