using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using UserPreferencesEntity = ErrandsManagement.Domain.Entities.UserPreferences;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
using FluentValidation;
using FluentValidation.Results;
using MediatR;

namespace ErrandsManagement.Application.UserPreferences.Commands.UpdateCourierDefaults;

public sealed class UpdateCourierDefaultsHandler
    : IRequestHandler<UpdateCourierDefaultsCommand, Unit>
{
    private readonly IUserPreferencesRepository _repo;
    private readonly IUserRepository _userRepository;
    private readonly ISystemConfigReader _configReader;

    public UpdateCourierDefaultsHandler(
        IUserPreferencesRepository repo,
        IUserRepository userRepository,
        ISystemConfigReader configReader)
    {
        _repo = repo;
        _userRepository = userRepository;
        _configReader = configReader;
    }

    public async Task<Unit> Handle(UpdateCourierDefaultsCommand cmd, CancellationToken ct)
    {
        var user = await _userRepository.FindByIdAsync(cmd.UserId, ct);
        if (user is null || !user.Roles.Contains(UserRole.Courier.ToString()))
            throw new ForbiddenAccessException("Only Couriers can update courier defaults.");

        if (cmd.MaxConcurrentAssignments.HasValue)
        {
            var config = await _configReader.GetAsync(ct);
            var ceiling = config.RecommendationPolicy.MaxActiveAssignments;
            if (cmd.MaxConcurrentAssignments.Value > ceiling)
                throw new ValidationException(new[]
                {
                    new ValidationFailure(nameof(cmd.MaxConcurrentAssignments),
                        $"MaxConcurrentAssignments cannot exceed the system ceiling of {ceiling}.")
                });
        }

        var existing = await _repo.GetByUserIdAsync(cmd.UserId, ct);
        var isNew = existing is null;
        var prefs = existing ?? UserPreferencesEntity.CreateForUser(cmd.UserId);

        prefs.UpdateCourierDefaults(new CourierDefaults
        {
            BaseLatitude = cmd.BaseLatitude,
            BaseLongitude = cmd.BaseLongitude,
            BaseCity = cmd.BaseCity,
            MaxConcurrentAssignments = cmd.MaxConcurrentAssignments,
            AvailableDaysOfWeek = cmd.AvailableDaysOfWeek,
            AvailableFromHour = cmd.AvailableFromHour,
            AvailableToHour = cmd.AvailableToHour
        });

        if (isNew)
            await _repo.AddAsync(prefs, ct);

        await _repo.SaveChangesAsync(ct);
        return Unit.Value;
    }
}