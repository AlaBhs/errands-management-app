# Errands Management App

This branch completes the request creation form per the original specification
and improves data quality throughout the request lifecycle.

## Key Features

### Request Enhancements
- **Category** — required field with filter support across all list pages and color-coded badges
- **Contact Person & Phone** — optional vis-à-vis info displayed in the delivery address section
- **Comment** — optional operational notes for the courier, highlighted in amber on details page
- **24h deadline validation** — enforced on both backend and frontend per spec requirement
- **Duration display** — completed requests show how long the assignment took

### UX Improvements
- Color-coded `PriorityBadge` and `CategoryBadge` components used consistently across all views
- Toast notifications across all mutations — request lifecycle, user management, logout
- All enums serialize as strings in the API — `"Pending"` instead of `0`

### Dev Seeder
- 4 demo users and 10 requests across all statuses seeded on first run
- Dev environment only — never runs in production

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:
```bash
docker-compose up --build
```
3. The Frontend is running on `http://localhost:3000`
4. The API will be available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to test the endpoints.

## Demo Credentials

All demo users share the password `Dev1234!`

| Role | Email |
|---|---|
| Admin | `admin@errands.local` — `Admin123!` |
| Collaborator | `sarah.johnson@ey.local` |
| Collaborator | `michael.chen@ey.local` |
| Courier | `courier1@ey.local` |
| Courier | `courier2@ey.local` |

## Notes

- All 177 tests pass with 0 failures (`dotnet test` from the `backend` directory).
- This branch includes all features from previous branches.