# Errands Management App

This branch implements full user management and hardens the authentication layer.

## Key Features

### User Management
- New `IsActive` and `CreatedAt` fields on users with EF Core migration
- Deactivated users are blocked at login with a clear error message
- Admins can deactivate and reactivate any user except their own account
- User list supports filtering by role, search, and active/inactive status
- Admin-only create user form with password strength validation

### Authentication Hardening
- Refresh token moved to an **HttpOnly cookie** — no tokens ever stored in
  `localStorage` or `sessionStorage`
- Access token lives in memory only, silently refreshed on app load
- JWT now carries `fullName` and a short `role` claim
- Role-based route protection via `RoleGuard` component

### API Endpoints
- `GET /api/users` — paginated user list with role, search, and status filters
- `GET /api/users/{id}` — user details
- `PATCH /api/users/{id}/deactivate` — deactivate a user
- `PATCH /api/users/{id}/activate` — reactivate a user
- `POST /api/auth/login` — now sets refresh token as HttpOnly cookie
- `POST /api/auth/refresh` — reads token from cookie, no body required
- `POST /api/auth/logout` — clears the cookie server-side

All `/api/users` endpoints require the `Admin` role.

### Frontend
- `/admin/users` — full user management page with table, filters, and create form
- `/admin` — admin overview page wired to real user data
- Topbar shows real user name and role badge with a logout dropdown
- Sidebar shows User Management link for Admin users only

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:
```bash
docker-compose up --build
```

3. The API will be available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to test the endpoints.
4. Default admin credentials:
   - Email: `admin@errands.local`
   - Password: `Admin123!`

## Notes

- The frontend dev server proxies `/api` to `http://localhost:5000`.
- All 154 tests pass with 0 failures (`dotnet test` from the `backend` directory).
- This branch includes all features from previous branches.