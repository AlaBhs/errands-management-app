namespace ErrandsManagement.Domain.Common.Exceptions;

public class InvalidRequestStateException : DomainException
{
    public InvalidRequestStateException(string message)
        : base(message)
    {
    }
}