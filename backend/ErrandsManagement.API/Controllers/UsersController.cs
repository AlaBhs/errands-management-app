using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Users.Commands.ActivateUser;
using ErrandsManagement.Application.Users.Commands.DeactivateUser;
using ErrandsManagement.Application.Users.Commands.UpdateLocation;
using ErrandsManagement.Application.Users.Commands.CreateUser;
using ErrandsManagement.Application.Users.DTOs;
using ErrandsManagement.Application.Users.Queries.GetAllUsers;
using ErrandsManagement.Application.Users.Queries.GetUserById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class UsersController : ControllerBase
{
    private readonly ISender _mediator;

    public UsersController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] UserQueryParameters parameters,
        CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllUsersQuery(parameters), ct);
        return Ok(ApiResponse<PagedResult<UserListItemDto>>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetUserByIdQuery(id), ct);
        return Ok(ApiResponse<UserListItemDto>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Admin creates a user without a password.
    /// An activation email is sent automatically.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserCommand command,
        CancellationToken ct)
    {
        var userId = await _mediator.Send(command, ct);
        return CreatedAtAction(
            nameof(GetById),
            new { id = userId },
            ApiResponse<object>.SuccessResponse(
                new { userId },
                StatusCodes.Status201Created,
                HttpContext.TraceIdentifier));
    }

    [HttpPatch("{id:guid}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken ct)
    {
        var requestingUserId = GetCurrentUserId();
        await _mediator.Send(new DeactivateUserCommand(id, requestingUserId), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ActivateUserCommand(id), ct);
        return NoContent();
    }

    [HttpPut("me/location")]
    [Authorize]
    public async Task<IActionResult> UpdateLocation(
        [FromBody] UpdateLocationDto body,
        CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await _mediator.Send(
            new UpdateLocationCommand(userId, body.Latitude, body.Longitude, body.City), ct);
        return NoContent();
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User identity not found in token.");
        return Guid.Parse(value);
    }
}