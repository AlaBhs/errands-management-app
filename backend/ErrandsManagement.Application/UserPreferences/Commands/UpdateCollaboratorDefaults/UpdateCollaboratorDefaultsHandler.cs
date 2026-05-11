using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using UserPreferencesEntity = ErrandsManagement.Domain.Entities.UserPreferences;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
using MediatR;

namespace ErrandsManagement.Application.UserPreferences.Commands.UpdateCollaboratorDefaults;

public sealed class UpdateCollaboratorDefaultsHandler
    : IRequestHandler<UpdateCollaboratorDefaultsCommand, Unit>
{
    private readonly IUserPreferencesRepository _repo;
    private readonly IUserRepository _userRepository;

    public UpdateCollaboratorDefaultsHandler(
        IUserPreferencesRepository repo,
        IUserRepository userRepository)
    {
        _repo = repo;
        _userRepository = userRepository;
    }

    public async Task<Unit> Handle(UpdateCollaboratorDefaultsCommand cmd, CancellationToken ct)
    {
        var user = await _userRepository.FindByIdAsync(cmd.UserId, ct);
        if (user is null || !user.Roles.Contains(UserRole.Collaborator.ToString()))
            throw new ForbiddenAccessException("Only Collaborators can update collaborator defaults.");

        var existing = await _repo.GetByUserIdAsync(cmd.UserId, ct);
        var isNew = existing is null;
        var prefs = existing ?? UserPreferencesEntity.CreateForUser(cmd.UserId);

        prefs.UpdateCollaboratorDefaults(new CollaboratorDefaults
        {
            DefaultCategory = cmd.DefaultCategory,
            DefaultPriority = cmd.DefaultPriority,
            DefaultContactPerson = cmd.DefaultContactPerson,
            DefaultContactPhone = cmd.DefaultContactPhone
        });

        if (isNew)
            await _repo.AddAsync(prefs, ct);

        await _repo.SaveChangesAsync(ct);
        return Unit.Value;
    }
}