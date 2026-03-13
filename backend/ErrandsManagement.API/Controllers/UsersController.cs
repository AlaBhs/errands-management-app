using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Users.Commands.DeactivateUser;
using ErrandsManagement.Application.Users.DTOs;
using ErrandsManagement.Application.Users.Queries.GetAllUsers;
using ErrandsManagement.Application.Users.Queries.GetUserById;
using ErrandsManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class UsersController : ControllerBase
{
    private readonly ISender _mediator;

    public UsersController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] UserQueryParameters parameters,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetAllUsersQuery(parameters),
            cancellationToken);

        return Ok(ApiResponse<PagedResult<UserListItemDto>>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetUserByIdQuery(id),
            cancellationToken);

        return Ok(ApiResponse<UserListItemDto>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpPatch("{id:guid}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deactivate(
        Guid id,
        CancellationToken cancellationToken)
    {
        var requestingUserId = GetCurrentUserId();

        await _mediator.Send(
            new DeactivateUserCommand(id, requestingUserId),
            cancellationToken);

        return NoContent();
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException(
                "User identity not found in token.");

        return Guid.Parse(value);
    }
}