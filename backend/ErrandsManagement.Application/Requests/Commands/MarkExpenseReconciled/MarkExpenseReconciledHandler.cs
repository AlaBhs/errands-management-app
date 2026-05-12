using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.MarkExpenseReconciled
{
    public sealed class MarkExpenseReconciledHandler : IRequestHandler<MarkExpenseReconciledCommand>
    {
        private readonly IRequestRepository _repo;

        public MarkExpenseReconciledHandler(IRequestRepository repo) => _repo = repo;

        public async Task Handle(MarkExpenseReconciledCommand cmd, CancellationToken ct)
        {
            var request = await _repo.GetByIdAsync(cmd.RequestId, ct)
                ?? throw new NotFoundException("Request not found.");

            request.MarkReconciled();

            await _repo.SaveChangesAsync(ct);
        }
    }
}
