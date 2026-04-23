using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.SetAdvancedAmount
{
    public sealed class SetAdvancedAmountHandler : IRequestHandler<SetAdvancedAmountCommand>
    {
        private readonly IRequestRepository _repo;

        public SetAdvancedAmountHandler(IRequestRepository repo) => _repo = repo;

        public async Task Handle(SetAdvancedAmountCommand cmd, CancellationToken ct)
        {
            var request = await _repo.GetByIdAsync(cmd.RequestId, ct)
                ?? throw new NotFoundException("Request not found.");

            request.SetAdvancedAmount(cmd.Amount);

            await _repo.SaveChangesAsync(ct);
        }
    }
}
