using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Attachments.Commands.UploadAttachment;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/requests/{requestId:guid}/attachments")]
[Authorize]
public sealed class AttachmentsController : ControllerBase
{
    private readonly ISender _mediator;

    public AttachmentsController(ISender mediator)
    {
        _mediator = mediator;
    }

    /// <summary>POST /api/requests/{requestId}/attachments</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Collaborator")]
    [RequestSizeLimit(10 * 1024 * 1024)]          // 10 MB hard limit at HTTP level
    [RequestFormLimits(MultipartBodyLengthLimit = 10 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
        Guid requestId,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(
                ApiResponse<string>.FailureResponse(
                    "No file provided.",
                    StatusCodes.Status400BadRequest,
                    HttpContext.TraceIdentifier));

        await using var stream = file.OpenReadStream();

        var command = new UploadAttachmentCommand(
            RequestId: requestId,
            FileName: file.FileName,
            ContentType: file.ContentType,
            FileSize: file.Length,
            FileStream: stream);

        var result = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(
            nameof(Upload),
            new { requestId },
            ApiResponse<object>.SuccessResponse(
                result,
                StatusCodes.Status201Created,
                HttpContext.TraceIdentifier));
    }
}