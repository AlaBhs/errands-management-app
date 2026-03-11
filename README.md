# Errands Management App

This branch implements secure authentication and authorization using 
ASP.NET Identity, JWT access tokens, and refresh tokens. It builds on 
all previous features and secures every endpoint with role-based access control.

## What's New in This Branch

### Backend
- **ASP.NET Identity** integrated into the existing database — 
  `AspNetUsers`, `AspNetRoles`, and related tables added via migration.
- **JWT Authentication** — access tokens (15 min) signed with HMAC-SHA256, 
  containing user ID, email, and role claims.
- **Refresh Tokens** — 7-day tokens stored in a `RefreshTokens` table, 
  with rotation on every refresh and revocation on logout.
- **Role-Based Authorization** — three roles enforced across all endpoints:

  | Role | Permissions |
  |---|---|
  | Admin | Register users, assign requests, view all |
  | Collaborator | Create requests, cancel, submit survey, view own |
  | Courier | Start, complete requests, view assigned |

- **Auth Endpoints**:
  - `POST /api/auth/login` — returns access token + refresh token
  - `POST /api/auth/refresh` — rotates refresh token, returns new pair
  - `POST /api/auth/logout` — revokes refresh token
  - `POST /api/auth/register` — Admin only, creates user accounts

- **Security Fix** — `RequesterId` is now extracted from the JWT claims 
  server-side. Clients can no longer supply or spoof their own user ID.

- **Identity Seeder** — roles and a default admin account are created 
  automatically on first startup.

- **Clean Architecture** — `IJwtTokenGenerator` and `IUserRepository` 
  interfaces defined in Application layer, implemented in Infrastructure. 
  No layer violations.

- **Docker** — JWT secret and settings injected via environment variables. 
  SQL Server healthcheck added to prevent backend startup race condition.

## Default Credentials (Dev Only)

| Email | Password | Role |
|---|---|---|
| admin@errands.local | Admin123! | Admin |

> The admin account is seeded automatically on first run.
> Use it to create Collaborator and Courier accounts via `/api/auth/register`.

## How to Test with Docker (Full Stack)

1. Ensure Docker Desktop is running.

2. Copy the example env file and set your JWT secret:
```bash
   cp .env.example .env
```

3. Start all services:
```bash
   docker-compose up --build
```

4. Access the application:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000`
   - **API Docs (Scalar)**: `http://localhost:5000/scalar`

## Testing the Auth Flow (Step by Step)

### 1. Login as Admin
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@errands.local",
  "password": "Admin123!"
}
```
Copy the `accessToken` and `refreshToken` from the response.

### 2. Create a Collaborator account
```http
POST /api/auth/register
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fullName": "Alice Dupont",
  "email": "alice@errands.local",
  "password": "Alice123!",
  "role": "Collaborator"
}
```

### 3. Create a Courier account
```http
POST /api/auth/register
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fullName": "Bob Martin",
  "email": "bob@errands.local",
  "password": "Bob12345!",
  "role": "Courier"
}
```

### 4. Login as Collaborator and create a request
Login with Alice's credentials, then:
```http
POST /api/requests
Authorization: Bearer {alice_accessToken}
Content-Type: application/json

{
  "title": "Deliver package",
  "description": "Urgent document delivery to client office",
  "deliveryAddress": {
    "street": "45 Avenue Habib Bourguiba",
    "city": "Sousse",
    "postalCode": "4000",
    "country": "Tunisia",
    "note": "Call upon arrival"
  },
  "priority": 2,
  "deadline": "2026-20-10T14:00:00Z",
  "estimatedCost": 35.50
}
```

### 5. Verify role enforcement
Try hitting an Admin-only endpoint with Alice's token — expect `403 Forbidden`:
```http
POST /api/requests/{id}/assign
Authorization: Bearer {alice_accessToken}
```

### 6. Test token refresh
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "token": "{refreshToken}"
}
```
Returns a new access token and a new refresh token. The old refresh 
token is now invalid.

### 7. Logout
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "refreshToken": "{refreshToken}"
}
```
Attempting to refresh after logout returns `401 Unauthorized`.

## Notes
- The frontend does not yet have login UI — auth testing is via 
  Scalar (`/scalar`) or any HTTP client (Postman, curl).
- Existing seeded data from previous branches remains available.
- All previous request lifecycle features remain intact and are now 
  protected by role-based authorization.