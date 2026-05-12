using ErrandsManagement.Application.Interfaces;
using MediatR;
using UserPreferencesEntity = ErrandsManagement.Domain.Entities.UserPreferences;

namespace ErrandsManagement.Application.UserPreferences.Commands.UpdateNotificationPreferences;

public sealed class UpdateNotificationPreferencesHandler
    : IRequestHandler<UpdateNotificationPreferencesCommand, Unit>
{
    private readonly IUserPreferencesRepository _repo;

    public UpdateNotificationPreferencesHandler(IUserPreferencesRepository repo)
    {
        _repo = repo;
    }

    public async Task<Unit> Handle(UpdateNotificationPreferencesCommand cmd, CancellationToken ct)
    {
        var existing = await _repo.GetByUserIdAsync(cmd.UserId, ct);
        var isNew = existing is null;
        var prefs = existing ?? UserPreferencesEntity.CreateForUser(cmd.UserId);

        prefs.UpdateNotificationPreferences(cmd.DisabledTypes);

        if (isNew)
            await _repo.AddAsync(prefs, ct);

        await _repo.SaveChangesAsync(ct);
        return Unit.Value;
    }
}