using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.SubmitSurvey
{
    public sealed class SubmitSurveyHandler : IRequestHandler<SubmitSurveyCommand>
    {
        private readonly IRequestRepository _repository;

        public SubmitSurveyHandler(IRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task Handle(
            SubmitSurveyCommand command,
            CancellationToken cancellationToken)
        {
            var request = await _repository.GetByIdAsync(
                command.RequestId,
                cancellationToken);

            if (request is null)
                throw new NotFoundException("Request not found.");

            request.SubmitSurvey(command.Rating, command.Comment);

            await _repository.SaveChangesAsync(cancellationToken);
        }
    }
}
