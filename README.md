# Errands Management App

This branch delivers a comprehensive UI/UX overhaul across the entire
application — redesigned pages, dark mode, improved navigation, and
a more professional enterprise feel throughout.

## What's New — `feature/ux-improvements`

### Authentication & Routing
- Redesigned login page with EY branding, animated error feedback,
  and human-friendly error messages mapped from backend responses
- Landing page for unauthenticated users at `/` with hero, features
  grid, benefits section, and request lifecycle timeline
- Fixed post-logout URL redirect — next login always lands on dashboard
- Fixed role-based redirect after login — collaborators and couriers
  no longer hit a 403

### Navigation Shell
- Collapsible sidebar — icon-only mode at 68px, expanded at 256px,
  persisted across sessions
- Nested sub-navigation for Admin Panel — User Management and future
  admin pages expand inline with chevron toggle
- Topbar with dynamic breadcrumb, role-based quick action, notifications
  dropdown, and theme toggle
- Logout moved to sidebar footer — consistent session action placement

### Dark Mode
- Full dark mode support across all pages and components
- Persisted to localStorage, respects system preference on first visit
- Sun/Moon toggle in topbar
- EY brand colors (`#2E2E38`, `#FFE600`) preserved in both modes

### Request List Pages
- Table and card view toggle — preference persisted to localStorage
- Unified filter toolbar matching analytics page style with active
  filter chips and clear all button
- Skeleton loading states matching content shape — no blank flash
- Clickable rows — no more "View" link at end of each row
- Priority color accent on table rows and card left border
- Contextual empty states — different message when filters are active

### My Schedule (Courier)
- Renamed from "My Assignments" — more human language
- Summary strip — Awaiting Start, In Progress, Urgent counters,
  each clickable to filter the list instantly
- Inline Start button on Assigned cards
- Quick complete modal — actual cost, note, and discharge photo
  submitted without navigating to details page
- Overdue indicator in red on deadline
- Urgent requests show Zap badge and red ring

### My Requests (Collaborator)
- Status summary strip — Pending, Active, Completed, Cancelled
- Survey prompt banner on completed cards missing a review
- Quick survey modal — star rating with hover labels, optional comment,
  submitted directly from the list without opening details
- Overdue indicator on active requests past their deadline
- New Request button always visible in page header

### Request Details Page
- Two-column layout — main content left, actions and info right
- Visual activity timeline with icons and color per event type
- Skeleton loading state matching two-column layout
- Cancel request modal — replaces inline form, destructive action pattern
- Star rating in survey section — replaces number circles
- Actions panel redesigned with cleaner visual hierarchy

### Dashboard
- KPI stat cards restored for all three roles
- Status distribution chart visible for Admin, Collaborator, and Courier
- Skeleton loading on all stat cards
- Overdue panel for Admin, pending surveys panel for Collaborator,
  avg rating for Courier in the insights section
- Last 30 days filter on all stat queries — numbers stay meaningful
  over time

### User Management
- Confirm modal before deactivating a user
- Confirm modal before activating a user
- Skeleton rows instead of page spinner
- Filter toolbar matching analytics style

### Confirm Dialogs
- Reusable `ConfirmModal` component — configurable label, color, icon
- Deactivate user — modal with name and access warning
- Delete attachment — inline Yes/No confirmation, no modal overlay

### 404 Page
- EY branded dark background matching login and landing pages
- Go back and Back to Dashboard/Home actions
- Authenticated users go to `/dashboard`, guests go to `/`

### PageErrorBoundary
- Wraps every page route — sidebar stays functional when a page crashes
- Error detail shown in development only

### Performance
- Route-level code splitting with `React.lazy` and `Suspense`
- Vendor chunk splitting — react, query, radix-ui, icons, forms
  each in separate cached chunks
- Initial bundle reduced from 655 kB to ~200 kB core chunk

### Architecture
- Moved layouts to `src/app/layouts/`
- Added `src/app/pages/` for app-level pages
- Converted all default exports to named exports
- Moved `StatusBadge`, `PriorityBadge`, `CategoryBadge` to
  `src/shared/components/` — used across features
- Removed direct API calls from pages — all go through hooks
- Removed `requestsApi` and `usersApi` from barrel exports
- Standardized all router imports to `react-router-dom`

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

- All 265 tests pass with 0 failures (`dotnet test` from the `backend`
  directory). No new backend changes in this branch.
- Dark mode preference persists across sessions via localStorage.
- This branch includes all features from all previous branches.