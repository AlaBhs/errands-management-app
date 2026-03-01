using ErrandsManagement.Application.Requests.Commands.CreateRequest;
using ErrandsManagement.Domain.Common.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class RequestsController : ControllerBase
{
    private readonly CreateRequestHandler _handler;

    public RequestsController(CreateRequestHandler handler)
    {
        _handler = handler;
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
    public IActionResult GetById(Guid id)
    {
        return Ok(); // placeholder
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