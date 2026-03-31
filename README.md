# Errands Management App

This branch adds a real-time notification system — admins are notified
when new requests arrive, couriers are notified when they are assigned,
and all users receive updates as their requests progress through the
lifecycle.

## What's New — `feature/notifications`

### Real-Time Notifications (Backend)
- SignalR hub at `/hubs/notifications` — JWT authenticated, each user
  joins a group named after their UserId for targeted delivery
- Two-step flow: domain event → persist notification to database →
  real-time push via SignalR — persistence and delivery are fully
  decoupled
- `INotificationRealtimeService` abstraction in Application — SignalR
  is only referenced in the API layer, never in handlers
- `INotificationHubProxy` abstraction — Infrastructure never references
  the hub type, eliminating the Infrastructure → API dependency violation

### Notification Domain Model
- `Notification` entity: `Id`, `UserId`, `Message`, `Type` (enum),
  `ReferenceId` (optional, links to the related request), `IsRead`,
  `CreatedAt`
- `NotificationType` enum: `RequestCreated`, `RequestAssigned`,
  `RequestStarted`, `RequestCompleted`, `RequestCancelled`, `General`
- EF Core configuration with compound index on `(UserId, IsRead)` for
  fast per-user queries

### Domain Events
Five domain events trigger notifications automatically — command
handlers never create notifications directly:
- `RequestCreatedEvent` → all Admin users notified of new request
- `RequestAssignedEvent` → assigned courier notified
- `RequestStartedEvent` → requester notified work has started
- `RequestCompletedEvent` → requester notified of completion
- `RequestCancelledEvent` → requester notified of cancellation

### Notification API Endpoints
- `GET /api/notifications` — paginated list with optional `unreadOnly`
  filter, returns notifications + unread count + pagination metadata
- `GET /api/notifications/unread-count` — lightweight count-only
  endpoint for navbar badge refresh
- `POST /api/notifications/{id}/read` — mark single notification as read
- `POST /api/notifications/read-all` — mark all as read in one call

### Extensibility
Adding a new delivery channel (email, Teams, push) requires one new
handler implementing `INotificationHandler<NotificationCreatedEvent>`
— zero changes to existing code. The `NotificationCreatedEvent` is the
extension point.

### Real-Time Notifications (Frontend)
- SignalR connection service at `shared/api/signalr.ts` — app-wide
  singleton at the same architectural level as the Axios client
- Connection starts on login and app load, stops on logout,
  reconnects automatically after silent token refresh
- Zustand notification store — optimistic mark-as-read with rollback,
  `hasFetched` guard prevents redundant API calls on every dropdown open
- `NotificationBell` in the topbar — unread badge, opens dropdown,
  subscribes to SignalR and fires a toast on incoming push
- `NotificationDropdown` — 5 most recent notifications, color-coded
  by type, mark all read, "View all" footer link
- `NotificationItem` — click marks as read and navigates to the related
  request if a `referenceId` exists
- `/notifications` full page — paginated list (15 per page), All /
  Unread toggle, load more, real-time updates via SignalR subscription,
  skeleton loading, contextual empty states
- Dummy bell and hardcoded `DUMMY_NOTIFICATIONS` in `Topbar.tsx`
  replaced entirely

### Notification Type Colors
| Type | Color | Meaning |
|---|---|---|
| RequestCreated | Blue | New request submitted |
| RequestAssigned | Yellow | Courier assigned |
| RequestStarted | Orange | Work in progress |
| RequestCompleted | Green | Request completed |
| RequestCancelled | Red | Request cancelled |
| General | Gray | General notification |

### Architecture Decisions
- `INotificationHubProxy` defined in Application, implemented in API —
  keeps Infrastructure free of any API-layer dependency
- `tokenFactory` parameter on SignalR connect — avoids circular import
  between auth store and SignalR service
- `handlers` stored as a `Set` — bell toast and notifications page can
  both subscribe without one overwriting the other
- Dropdown shows 5 items, full page shows 15 — different purposes,
  different page sizes, separate local state to avoid interference
- `reset()` on logout wipes notification store — prevents data leak
  between users on shared browser sessions

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:
```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

### Testing Real-Time Notifications
1. Log in as Admin in one browser tab
2. Log in as Collaborator in another tab or incognito window
3. Create a request as Collaborator — Admin receives a bell badge
   and a toast instantly
4. Assign the request as Admin — the Courier receives a notification
5. Start, complete, or cancel — the requester is notified at each step

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@errands.local` | `Admin123!` |
| Collaborator | `sarah.johnson@ey.local` | `Dev1234!` |
| Collaborator | `michael.chen@ey.local` | `Dev1234!` |
| Courier | `courier1@ey.local` | `Dev1234!` |
| Courier | `courier2@ey.local` | `Dev1234!` |

## Notes

- All 297 tests pass with 0 failures (`dotnet test` from the `backend`
  directory).
- SignalR requires `AllowCredentials()` in the CORS policy and JWT
  passed as `?access_token=` query string — both are configured.
- This branch includes all features from all previous branches.