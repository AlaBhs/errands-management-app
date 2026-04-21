namespace ErrandsManagement.Application.Common.Exceptions
{
    public sealed class ForbiddenAccessException : ApplicationException
    {
        public ForbiddenAccessException(string message)
            : base(message)
        {
        }
    }
}
