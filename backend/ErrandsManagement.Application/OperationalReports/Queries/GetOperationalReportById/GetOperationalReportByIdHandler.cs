using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.OperationalReports.DTOs;
using MediatR;

namespace ErrandsManagement.Application.OperationalReports.Queries.GetOperationalReportById;

public sealed class GetOperationalReportByIdHandler
    : IRequestHandler<GetOperationalReportByIdQuery, OperationalReportDto>
{
    private readonly IOperationalReportRepository _repository;

    public GetOperationalReportByIdHandler(IOperationalReportRepository repository)
    {
        _repository = repository;
    }

    public async Task<OperationalReportDto> Handle(
        GetOperationalReportByIdQuery request,
        CancellationToken cancellationToken)
    {
        var report = await _repository.GetByIdAsync(request.ReportId, cancellationToken)
            ?? throw new NotFoundException(nameof(OperationalReport), request.ReportId);

        return new OperationalReportDto(
            report.Id,
            report.GeneratedAt,
            report.PeriodFrom,
            report.PeriodTo,
            report.MetricsSnapshot,
            report.AiAnalysis,
            report.AiUnavailable,
            report.GeneratedByUserId);
    }
}
