using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Requests.Commands.AssignRequest;
using ErrandsManagement.Application.Requests.Commands.CancelRequest;
using ErrandsManagement.Application.Requests.Commands.CompleteRequest;
using ErrandsManagement.Application.Requests.Commands.CreateRequest;
using ErrandsManagement.Application.Requests.Commands.StartRequest;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using ErrandsManagement.Application.Requests.Queries.GetRequestById;
using ErrandsManagement.Domain.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class RequestsController : ControllerBase
{
    private readonly CreateRequestHandler _handler;
    private readonly GetRequestByIdHandler _getHandler;
    private readonly GetAllRequestsHandler _getAllRequestsHandler;
    private readonly AssignRequestHandler _assignRequestHandler;
    private readonly StartRequestHandler _startRequestHandler;
    private readonly CompleteRequestHandler _completeRequestHandler;
    private readonly CancelRequestHandler _cancelRequestHandler;

    public RequestsController(
        CreateRequestHandler handler,
        GetRequestByIdHandler getHandler, 
        GetAllRequestsHandler getAllHandler,
        AssignRequestHandler assignHandler,
        StartRequestHandler startRequestHandler,
        CompleteRequestHandler completeRequestHandler,
        CancelRequestHandler cancelRequestHandler
        )
    {
        _handler = handler;
        _getHandler = getHandler;
        _getAllRequestsHandler = getAllHandler;
        _assignRequestHandler = assignHandler;
        _startRequestHandler = startRequestHandler;
        _completeRequestHandler = completeRequestHandler;
        _cancelRequestHandler = cancelRequestHandler;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateRequestCommand command,
        CancellationToken cancellationToken)
    {
        var id = await _handler.Handle(command, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            new { id });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
    Guid id,
    CancellationToken cancellationToken)
    {
        var result = await _getHandler.Handle(
            new GetRequestByIdQuery(id),
            cancellationToken);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _getAllRequestsHandler
            .Handle(new GetAllRequestsQuery(), cancellationToken);

        return Ok(result);
    }

    [HttpPost("{id:guid}/assign")]
    public async Task<IActionResult> Assign(
        Guid id,
        [FromBody] AssignRequestDto request,
        CancellationToken cancellationToken)
    {
        var command = new AssignRequestCommand(id, request.CourierId);

        await _assignRequestHandler.Handle(command, cancellationToken);

        return NoContent();
    }

    [HttpPost("{id:guid}/start")]
    public async Task<IActionResult> Start(Guid id, CancellationToken cancellationToken)
    {
        var command = new StartRequestCommand(id);

        await _startRequestHandler.Handle(command, cancellationToken);

        return NoContent();
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(
    Guid id,
    [FromBody] CompleteRequestRequest request,
    CancellationToken cancellationToken)
    {
        var command = new CompleteRequestCommand(
            id,
            request.ActualCost,
            request.Note);

        await _completeRequestHandler.Handle(command, cancellationToken);

        return NoContent();
    }
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(
    Guid id,
    [FromBody] CancelRequestDto request,
    CancellationToken cancellationToken)
    {
        var command = new CancelRequestCommand(id, request.Reason);

        await _cancelRequestHandler.Handle(command, cancellationToken);

        return NoContent();
    }
    // ============================= DEBUG =============================
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok("API is working");
    }

    [HttpGet("test-exception")]
    public IActionResult TestException()
    {
        throw new InvalidRequestStateException("Test domain exception.");
    }
    // ============================= DEBUG =============================
}