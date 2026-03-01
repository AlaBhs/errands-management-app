using ErrandsManagement.Application.Requests.Commands.CreateRequest;
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
    public RequestsController(CreateRequestHandler handler,GetRequestByIdHandler getHandler)
    {
        _handler = handler;
        _getHandler = getHandler;
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
}