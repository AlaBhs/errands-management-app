using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.RemoveExpenseRecord
{
    public sealed class RemoveExpenseRecordHandler : IRequestHandler<RemoveExpenseRecordCommand>
    {
        private readonly IRequestRepository _repo;

        public RemoveExpenseRecordHandler(IRequestRepository repo) => _repo = repo;

        public async Task Handle(RemoveExpenseRecordCommand cmd, CancellationToken ct)
        {
            var request = await _repo.GetByIdAsync(cmd.RequestId, ct)
                ?? throw new NotFoundException("Request not found.");

            request.RemoveExpense(cmd.ExpenseRecordId);

            await _repo.SaveChangesAsync(ct);
        }
    }
}
