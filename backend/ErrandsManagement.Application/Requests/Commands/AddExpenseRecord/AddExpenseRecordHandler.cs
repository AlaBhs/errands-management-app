using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.AddExpenseRecord
{
    public sealed class AddExpenseRecordHandler : IRequestHandler<AddExpenseRecordCommand, Guid>
    {
        private readonly IRequestRepository _repo;

        public AddExpenseRecordHandler(IRequestRepository repo) => _repo = repo;

        public async Task<Guid> Handle(AddExpenseRecordCommand cmd, CancellationToken ct)
        {
            var request = await _repo.GetByIdAsync(cmd.RequestId, ct)
                ?? throw new NotFoundException("Request not found.");

            request.AddExpense(cmd.Category, cmd.Amount, cmd.CreatedBy, cmd.Description);

            await _repo.SaveChangesAsync(ct);

            // Return the Id of the newly created expense record
            return request.ExpenseRecords.Last().Id;
        }
    }
}
