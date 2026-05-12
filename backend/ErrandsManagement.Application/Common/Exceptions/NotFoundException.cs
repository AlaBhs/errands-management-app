namespace ErrandsManagement.Application.Common.Exceptions
{
    public sealed class NotFoundException : ApplicationException
    {
        public NotFoundException(string message)
            : base(message)
        {
        }
    }
}
