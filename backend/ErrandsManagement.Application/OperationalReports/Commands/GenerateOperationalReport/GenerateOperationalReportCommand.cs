using ErrandsManagement.Application.OperationalReports.DTOs;
using MediatR;

namespace ErrandsManagement.Application.OperationalReports.Commands.GenerateOperationalReport;

public sealed record GenerateOperationalReportCommand(
    Guid RequestedByUserId,
    DateTime? From = null,
    DateTime? To = null
) : IRequest<OperationalReportDto>;
