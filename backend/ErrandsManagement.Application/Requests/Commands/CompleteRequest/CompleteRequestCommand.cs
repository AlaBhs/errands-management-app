using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.CompleteRequest;

public sealed record CompleteRequestCommand(
    Guid RequestId,
    decimal? ActualCost,
    string? Note,
    string? DischargePhotoFileName,
    string? DischargePhotoContentType,
    long DischargePhotoSize,
    Stream? DischargePhotoStream
) : IRequest;
