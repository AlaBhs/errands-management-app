using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Users.Commands.UploadProfilePhoto;

public sealed class UploadProfilePhotoHandler
    : IRequestHandler<UploadProfilePhotoCommand, string>
{
    private readonly IUserRepository _users;
    private readonly IFileStorageService _fileStorage;

    public UploadProfilePhotoHandler(
        IUserRepository users,
        IFileStorageService fileStorage)
    {
        _users = users;
        _fileStorage = fileStorage;
    }

    public async Task<string> Handle(
        UploadProfilePhotoCommand request, CancellationToken ct)
    {
        _ = await _users.FindByIdAsync(request.UserId, ct)
            ?? throw new NotFoundException($"User {request.UserId} not found.");

        var url = await _fileStorage.SaveAsync(
            request.FileStream,
            request.FileName,
            request.ContentType,
            ct);

        // Pass null for FullName — UpdateProfileAsync only updates
        // ProfilePhotoUrl when the argument is not null
        await _users.UpdateProfileAsync(request.UserId, null!, url, ct);

        return _fileStorage.GetUrl(url);
    }
}