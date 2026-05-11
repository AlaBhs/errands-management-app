using ErrandsManagement.Application.Interfaces;
using UserPreferencesEntity = ErrandsManagement.Domain.Entities.UserPreferences;
using MediatR;

namespace ErrandsManagement.Application.UserPreferences.Commands.UpdateGeneralPreferences;

public sealed class UpdateGeneralPreferencesHandler
    : IRequestHandler<UpdateGeneralPreferencesCommand, Unit>
{
    private readonly IUserPreferencesRepository _repo;

    public UpdateGeneralPreferencesHandler(IUserPreferencesRepository repo)
    {
        _repo = repo;
    }

    public async Task<Unit> Handle(UpdateGeneralPreferencesCommand cmd, CancellationToken ct)
    {
        var existing = await _repo.GetByUserIdAsync(cmd.UserId, ct);
        var isNew = existing is null;
        var prefs = existing ?? UserPreferencesEntity.CreateForUser(cmd.UserId);

        prefs.UpdateGeneralPreferences(cmd.Language, cmd.Theme, cmd.DefaultView);

        if (isNew)
            await _repo.AddAsync(prefs, ct);

        await _repo.SaveChangesAsync(ct);
        return Unit.Value;
    }
}