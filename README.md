# Errands Management App

This branch implements a fully functional analytics dashboard for the Admin
role, replacing the previous static placeholder with real data.

## What's New — `feature/analytics`

### Analytics Dashboard (`/analytics` — Admin only)

- **KPI Cards** — Total requests, completed rate, active requests, avg
  survey rating, deadline compliance, and cost variance with animated
  counters and color-coded status indicators
- **Status Distribution** — Stacked proportional bar with per-status
  breakdown cards showing count and percentage
- **Pipeline Timing** — Average time spent in each lifecycle stage
  (queue wait, pickup delay, execution) with automatic bottleneck detection
- **Monthly Trend** — Area chart showing request volume over time
- **Category Breakdown** — Horizontal bar chart per request category
- **Cost Breakdown** — Estimated vs actual spend per category with
  variance analysis
- **Courier Performance** — Per-courier table with score badge, rating,
  on-time rate, and execution time

### Date Range Filter
Sticky filter bar with quick presets (Last 30 days, Last 3 months,
Last 6 months, All time), year dropdown, and custom date range picker.
All widgets update simultaneously when the filter changes.

### Dev Seeder
63 requests spread across 2024–2026 with realistic timestamps, giving
meaningful data across all filter presets on first run.

To re-seed from scratch:
```sql
DELETE FROM Surveys;
DELETE FROM AuditLogs;
DELETE FROM Assignments;
DELETE FROM Requests;
```

Then restart the API — the seeder runs automatically on startup.

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:
```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@errands.local` | `Admin123!` |
| Collaborator | `sarah.johnson@ey.local` | `Dev1234!` |
| Collaborator | `michael.chen@ey.local` | `Dev1234!` |
| Courier | `courier1@ey.local` | `Dev1234!` |
| Courier | `courier2@ey.local` | `Dev1234!` |

## Notes

- All 237 tests pass with 0 failures (`dotnet test` from the `backend` directory).
- The analytics dashboard is Admin-only — other roles are redirected by `RoleGuard`.
- This branch includes all features from all previous branches.
