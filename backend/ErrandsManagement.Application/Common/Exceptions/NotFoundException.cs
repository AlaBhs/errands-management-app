namespace ErrandsManagement.Application.Common.Exceptions
{
    public sealed class NotFoundException : ApplicationException
    {
        public NotFoundException(string message)
            : base(message)
        {
        }

        public NotFoundException(string entityName, object id)
            : base($"{entityName} with id {id} was not found.")
        {
        }
    }
}
