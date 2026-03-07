using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; private set; }
    public string Email { get; private set; }
    public bool IsActive { get; private set; }
    public UserRole Role { get; private set; }

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
    private User() { }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

    public User(string fullName, string email, UserRole role)
    {
        FullName = fullName;
        Email = email;
        Role = role;
        IsActive = true;
    }

    public void Deactivate()
    {
        if (!IsActive)
            return;

        IsActive = false;
        MarkAsUpdated();
    }

    public void Activate()
    {
        if (IsActive)
            return;

        IsActive = true;
        MarkAsUpdated();
    }

    public void ChangeRole(UserRole newRole)
    {
        if (Role == newRole)
            return;

        Role = newRole;
        MarkAsUpdated();
    }
}