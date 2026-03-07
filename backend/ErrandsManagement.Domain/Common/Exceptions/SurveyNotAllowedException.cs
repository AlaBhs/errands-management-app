namespace ErrandsManagement.Domain.Common.Exceptions;

public class SurveyNotAllowedException : DomainException
{
    public SurveyNotAllowedException(string message)
        : base(message)
    {
    }
}