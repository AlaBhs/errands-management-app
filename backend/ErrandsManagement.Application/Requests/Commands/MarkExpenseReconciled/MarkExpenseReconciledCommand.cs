using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.MarkExpenseReconciled
{
    public sealed record MarkExpenseReconciledCommand(Guid RequestId) : IRequest;

}
