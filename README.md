# Errands Management App

This branch implements role-based views, completes the full request lifecycle
flow per role, and improves data quality throughout the application.

## Key Features

### Role-Based Navigation & Access Control
- Each role has a dedicated sidebar, home route, and guarded pages
- `RoleGuard` redirects unauthorized roles away from protected routes
- Login redirects each role to their home route automatically
- **Admin** — Dashboard, All Requests, Analytics, Admin Panel, User Management
- **Collaborator** — Dashboard, My Requests, Create Request
- **Courier** — Dashboard, My Assignments

### Scoped Request Views
- Collaborators access only their own requests via `GET /api/requests/mine`
- Couriers access only their assigned requests via `GET /api/requests/assignments`
- `GET /api/requests` restricted to Admin — system-wide view
- `requesterId` removed from the create form — resolved from JWT on the backend

### Request Lifecycle Improvements
- Admin assign now shows a courier dropdown with name and email — no more raw GUIDs
- Courier cancel requires a reason — enforced on both backend and frontend
- Collaborator and Admin cancel reason is optional
- Request details show requester name and courier name instead of IDs
- `createdAt` added to request details

### API Endpoints
- `GET /api/requests/mine` — collaborator's own requests
- `GET /api/requests/assignments` — courier's assigned requests
- `POST /api/requests/{id}/cancel` — requires reason when caller is Courier

### Dashboard
- Each role sees a dashboard scoped to their own data
- Admin: total, pending, in-progress, and completed counts across all requests
- Collaborator: breakdown of their own requests by status
- Courier: breakdown of their assignments by status
- All counts are live — no static placeholder data

### UX Improvements
- All dates show day/month/year + hour:minute for full context
- Shared `formatDateTime` and `formatDate` utilities in `shared/utils/date.ts`
- Role-aware back link on request details — each role returns to their own list
- Removed dead `CourierSchedulePage` — replaced by `MyAssignmentsPage`

## Demo Credentials

All demo users share the same password: `Dev123!`

| Role | Email |
|---|---|
| Admin | `admin@errands.local` |
| Collaborator | `sarah.johnson@ey.local` |
| Collaborator | `michael.chen@ey.local` |
| Courier | `courier1@ey.local` |
| Courier | `courier2@ey.local` |

The dev seeder creates 10 requests across all statuses (Pending, Assigned,
InProgress, Completed, Cancelled) so every role has meaningful data to explore
on first login. The seeder only runs in the Development environment and is
idempotent — safe to restart without duplicate data.

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
- All 174 tests pass with 0 failures (`dotnet test` from the `backend` directory).
- This branch includes all features from previous branches.