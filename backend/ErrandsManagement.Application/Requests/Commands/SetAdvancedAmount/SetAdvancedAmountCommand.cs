using MediatR;


namespace ErrandsManagement.Application.Requests.Commands.SetAdvancedAmount
{
    public sealed record SetAdvancedAmountCommand(Guid RequestId, decimal Amount) : IRequest;

}
