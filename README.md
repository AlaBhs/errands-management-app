# Errands Management App

This branch adds **User Onboarding and Profile Management** — admins invite
users by email instead of creating passwords for them, and every user gets
their own profile page.

## What's New — `feature/user-onboarding-and-profile`

### Inviting a User (Admin)

Instead of setting a password on behalf of a new user, the admin simply enters
a name, email, and role. The system sends an activation email automatically.

### First Login (New User)

The user receives an email with a secure link. Clicking it opens a page where
they set their own password and activate their account. The link expires after
24 hours and can only be used once.

### Profile Page (All Users)

Every user now has a profile page accessible from the sidebar or by clicking
their avatar. From there they can update their name, change their password, and
upload a profile photo.

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:

```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`.

### Testing the Flow

1. Log in as Admin and go to **User Management**
2. Enter a name, a real email you can access, and a role — click **Send Invitation**
3. Open the email, click the activation link, and set a password
4. Log in with the new account and visit **My Profile** to update your details

## Notes

- All features from previous branches are included.
- Existing demo accounts are not affected and do not need to go through the
  activation flow.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@errands.local` | `Admin123!` |
| Collaborator | `sarah.johnson@ey.local` | `Dev1234!` |
| Collaborator | `michael.chen@ey.local` | `Dev1234!` |
| Courier | `courier1@ey.local` | `Dev1234!` |
| Courier | `courier2@ey.local` | `Dev1234!` |
| Reception | `reception1@errands.local` | `Reception123!` |
| Reception | `reception2@errands.local` | `Reception123!` |