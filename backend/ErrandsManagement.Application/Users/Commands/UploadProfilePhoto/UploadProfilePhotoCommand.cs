using MediatR;

namespace ErrandsManagement.Application.Users.Commands.UploadProfilePhoto;

public sealed record UploadProfilePhotoCommand(
    Guid UserId,
    Stream FileStream,
    string FileName,
    string ContentType) : IRequest<string>;