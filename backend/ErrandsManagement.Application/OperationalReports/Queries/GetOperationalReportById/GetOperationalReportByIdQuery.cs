using ErrandsManagement.Application.OperationalReports.DTOs;
using MediatR;

namespace ErrandsManagement.Application.OperationalReports.Queries.GetOperationalReportById;

public sealed record GetOperationalReportByIdQuery(Guid ReportId) : IRequest<OperationalReportDto>;
