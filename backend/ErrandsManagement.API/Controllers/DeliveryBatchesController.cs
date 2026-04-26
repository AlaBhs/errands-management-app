using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.DeliveryBatches.Commands.CancelDeliveryBatch;
using ErrandsManagement.Application.DeliveryBatches.Commands.ConfirmDeliveryPickup;
using ErrandsManagement.Application.DeliveryBatches.Commands.CreateDeliveryBatch;
using ErrandsManagement.Application.DeliveryBatches.Commands.MarkDeliveryHandedToReception;
using ErrandsManagement.Application.DeliveryBatches.Queries.GetDeliveryBatchById;
using ErrandsManagement.Application.DeliveryBatches.Queries.GetDeliveryBatches;
using ErrandsManagement.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/delivery-batches")]
[Authorize]
public sealed class DeliveryBatchesController : ControllerBase
{
    private readonly ISender _mediator;

    public DeliveryBatchesController(ISender mediator)
        => _mediator = mediator;

    // ── POST /api/delivery-batches ──────────────────────────
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateDeliveryBatchRequestBody body,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentUserId();

        var command = new CreateDeliveryBatchCommand(
            body.Title,
            body.ClientName,
            adminId,
            body.ClientPhone,
            body.PickupNote);

        var id = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            ApiResponse<Guid>.SuccessResponse(
                id, StatusCodes.Status201Created, HttpContext.TraceIdentifier));
    }

    // ── GET /api/delivery-batches ───────────────────────────
    [HttpGet]
    [Authorize(Roles = "Admin,Reception")]
    public async Task<IActionResult> GetAll(
        [FromQuery] DeliveryBatchStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var parameters = new DeliveryBatchQueryParameters
        {
            Status = status,
            Search = search,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(
            new GetDeliveryBatchesQuery(parameters),
            cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── GET /api/delivery-batches/{id} ──────────────────────
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Reception")]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var dto = await _mediator.Send(
            new GetDeliveryBatchByIdQuery(id),
            cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(
            dto, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── POST /api/delivery-batches/{id}/handover ────────────
    [HttpPost("{id:guid}/handover")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Handover(
        Guid id,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentUserId();

        await _mediator.Send(
            new MarkDeliveryHandedToReceptionCommand(id, adminId),
            cancellationToken);

        return Ok(ApiResponse<string>.SuccessResponse(
            "Handed to reception.", StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── POST /api/delivery-batches/{id}/confirm-pickup ──────
    [HttpPost("{id:guid}/confirm-pickup")]
    [Authorize(Roles = "Reception")]
    public async Task<IActionResult> ConfirmPickup(
        Guid id,
        [FromBody] ConfirmPickupRequestBody body,
        CancellationToken cancellationToken)
    {
        var receptionUserId = GetCurrentUserId();

        await _mediator.Send(
            new ConfirmDeliveryPickupCommand(id, receptionUserId, body.PickedUpBy),
            cancellationToken);

        return Ok(ApiResponse<string>.SuccessResponse(
            "Pickup confirmed.", StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── POST /api/delivery-batches/{id}/cancel ──────────────
    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Reception")]
    public async Task<IActionResult> Cancel(
        Guid id,
        [FromBody] CancelDeliveryBatchRequestBody body,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        await _mediator.Send(
            new CancelDeliveryBatchCommand(id, userId, body.Reason),
            cancellationToken);

        return Ok(ApiResponse<string>.SuccessResponse(
            "Delivery batch cancelled.", StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── Helpers ─────────────────────────────────────────────
    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User ID claim missing.");
        return Guid.Parse(claim);
    }
}

public sealed record CreateDeliveryBatchRequestBody(
    string Title,
    string ClientName,
    string? ClientPhone = null,
    string? PickupNote = null
);

public sealed record ConfirmPickupRequestBody(
    string? PickedUpBy = null
);

public sealed record CancelDeliveryBatchRequestBody(
    string? Reason = null
);