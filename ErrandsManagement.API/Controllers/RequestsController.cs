using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Requests.Commands.AssignRequest;
using ErrandsManagement.Application.Requests.Commands.CancelRequest;
using ErrandsManagement.Application.Requests.Commands.CompleteRequest;
using ErrandsManagement.Application.Requests.Commands.CreateRequest;
using ErrandsManagement.Application.Requests.Commands.StartRequest;
using ErrandsManagement.Application.Requests.Commands.SubmitSurvey;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using ErrandsManagement.Application.Requests.Queries.GetRequestById;
using ErrandsManagement.Domain.Common.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class RequestsController : ControllerBase
{
    //private readonly AssignRequestHandler _assignRequestHandler;
    //private readonly StartRequestHandler _startRequestHandler;
    //private readonly CompleteRequestHandler _completeRequestHandler;
    //private readonly CancelRequestHandler _cancelRequestHandler;
    //private readonly SubmitSurveyHandler _submitSurveyhandler;

    //public RequestsController(
    //    CreateRequestHandler handler,
    //    GetRequestByIdHandler getHandler,
    //    AssignRequestHandler assignHandler,
    //    StartRequestHandler startRequestHandler,
    //    CompleteRequestHandler completeRequestHandler,
    //    CancelRequestHandler cancelRequestHandler,
    //    SubmitSurveyHandler submitSurveyhandler)
    //{
    //    _handler = handler;
    //    _getHandler = getHandler;
    //    _getAllRequestsHandler = getAllHandler;
    //    _assignRequestHandler = assignHandler;
    //    _startRequestHandler = startRequestHandler;
    //    _completeRequestHandler = completeRequestHandler;
    //    _cancelRequestHandler = cancelRequestHandler;
    //    _submitSurveyhandler = submitSurveyhandler;
    //}

    private readonly IMediator _mediator;

    public RequestsController(IMediator mediator, GetRequestByIdHandler getHandler)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateRequestCommand command,
        CancellationToken cancellationToken)
    {
        var id = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            ApiResponse<Guid>.SuccessResponse(
                id,
                StatusCodes.Status201Created,
                HttpContext.TraceIdentifier));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
    Guid id,
    CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetRequestByIdQuery(id),
            cancellationToken);

        if (result is null)
            return NotFound();

        return Ok(ApiResponse<RequestDetailsDto>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAllRequestsQuery(), cancellationToken);

        return Ok(ApiResponse<List<RequestListItemDto>>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpPost("{id:guid}/assign")]
    public async Task<IActionResult> Assign(
        Guid id,
        [FromBody] AssignRequestDto request,
        CancellationToken cancellationToken)
    {
        var command = new AssignRequestCommand(id, request.CourierId);

        await _mediator.Send(command, cancellationToken);

        return NoContent();
    }

    [HttpPost("{id:guid}/start")]
    public async Task<IActionResult> Start(Guid id, CancellationToken cancellationToken)
    {
        var command = new StartRequestCommand(id);

        await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(
    Guid id,
    [FromBody] CompleteRequestDto request,
    CancellationToken cancellationToken)
    {
        var command = new CompleteRequestCommand(
            id,
            request.ActualCost,
            request.Note);

        await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(
    Guid id,
    [FromBody] CancelRequestDto request,
    CancellationToken cancellationToken)
    {
        var command = new CancelRequestCommand(id, request.Reason);

        await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpPost("{id:guid}/survey")]
    public async Task<IActionResult> SubmitSurvey(
    Guid id,
    SubmitSurveyDto request,
    CancellationToken cancellationToken)
    {

        var command = new SubmitSurveyCommand(
            id,
            request.Rating,
            request.Comment);

        await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
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