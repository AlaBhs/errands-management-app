namespace ErrandsManagement.Domain.Common.Exceptions;

public sealed class BusinessRuleException : DomainException
{
    public BusinessRuleException(string message)
        : base(message)
    {
    }
}