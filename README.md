# Errands Management App

This branch adds a **Request In-App Messaging System** — a real-time
discussion thread per request that allows Admin, the assigned Courier,
and the request owner (Collaborator) to exchange messages, with
persistent history, SignalR live delivery, and full integration with
the existing notification pipeline.

## What's New — `feature/request-messaging`

### Discussion Thread per Request
- Each Request has a **persistent message thread** — all messages
  are saved to the database and returned in chronological order
- Participants:
  - **Admin** — full access on any request
  - **Collaborator** — only on their own requests
  - **Courier** — only on requests they are (or were) assigned to
- Messages are **immutable after creation** — no edit, no delete;
  the thread is part of the request's audit history
- Participant authorization is enforced at the **Application layer**
  inside the CQRS handlers, not at the controller

### New API Endpoints

| Method | Route | Role | Description |
|---|---|---|---|
| `POST` | `/api/requests/{id}/messages` | Admin, Collaborator, Courier | Send a message (participants only) |
| `GET` | `/api/requests/{id}/messages` | Admin, Collaborator, Courier | Get full thread, oldest first |

### Real-Time Delivery (SignalR)
A new hub `RequestMessagingHub` is registered at `/hubs/request-messaging`.
Clients join a request-specific group and receive new messages live:

- Group naming convention: `request-{requestId}`
- Clients explicitly call `JoinRequestGroup(requestId)` when opening
  a thread and `LeaveRequestGroup(requestId)` when navigating away
- The hub **re-validates participant access** before adding a connection
  to the group — a valid JWT alone is not sufficient
- When a message is sent, the server pushes it to the group via
  `ReceiveRequestMessage`, reaching all connected participants
  including the sender

### Notification Integration
Sending a message triggers the **existing two-step notification
pipeline** — no duplication:

1. `RequestMessageCreatedEvent` → `CreateNotificationsOnRequestMessageCreated`
   → persists one `Notification` per recipient (everyone except the sender)
2. `NotificationCreatedEvent` → `SendRealtimeOnNotificationCreated`
   → delivers the notification badge over the existing `/hubs/notifications`

Recipient rules:
- Collaborator sends → Admin(s) + Courier (if assigned)
- Courier sends → Admin(s) + Collaborator
- Admin sends → Collaborator + Courier (if assigned)

A new `NotificationType.NewMessageReceived = 6` is added.
The `referenceId` on the notification carries the `requestId` for
deep-link navigation to the thread.

### Architecture

```
Domain/
├── Entities/
│   └── RequestMessage.cs              ← immutable, static Create factory
└── Events/
    └── RequestMessageCreatedEvent.cs

Application/
└── RequestMessages/
    ├── Commands/    SendRequestMessageCommand + Validator
    ├── Queries/     GetRequestMessagesQuery
    ├── Handlers/    SendRequestMessageHandler
    │                GetRequestMessagesHandler
    ├── Events/      CreateNotificationsOnRequestMessageCreated
    │                PushRealtimeOnRequestMessageCreated
    ├── DTOs/        RequestMessageDto · SendMessageDto
    └── Interfaces/  IRequestMessageRepository
                     IRequestMessagingRealtimeService
                     IRequestMessagingHubProxy

Infrastructure/
├── Repositories/   RequestMessageRepository
├── Configurations/ RequestMessageConfiguration
├── RealTime/       SignalRRequestMessagingService
└── Migrations/     20260421120000_AddRequestMessages

API/
├── Hubs/        RequestMessagingHub · RequestMessagingHubProxy
└── Controllers/ RequestMessagesController
```

Dependency direction is strictly one-way: Infrastructure → Application
→ Domain. The hub proxy pattern (`IRequestMessagingHubProxy`) mirrors
the existing notification architecture — Infrastructure never references
a SignalR hub type directly.

### Bug Fixes

**`fix(messaging)` — 403 for non-participants, Courier read access
after completion**
- `ExceptionHandlingMiddleware` was mapping `UnauthorizedAccessException`
  to `401 Unauthorized`. The correct HTTP status for an authenticated
  but non-permitted user is `403 Forbidden`. Frontend interceptors were
  silently treating the 401 as a token expiry, causing the GET thread
  endpoint to appear to return an empty array.
- The Courier participant check in `GetRequestMessagesHandler` was
  restricted to `IsActive` assignments. Once a request completes the
  assignment closes, locking the Courier out of thread history. Fixed
  to allow any historical assignment — Couriers retain read access after
  completion. The **send** handler keeps `IsActive` so Couriers cannot
  post on closed requests.

**`fix(api)` — UTC `Z` suffix on all DateTime serialization**
- SQL Server returns `DateTime` with `Kind = Unspecified`. `System.Text.Json`
  serializes that without a trailing `Z`, producing `"2026-04-22T11:43:43.586"`.
  The browser treats bare strings as local time — causing timestamps to
  appear one hour behind for UTC+1 users (`timeago` showed "about an hour
  ago" for a message just sent).
- A `UtcDateTimeConverter` is registered globally on the JSON serializer,
  forcing `DateTimeKind.Utc` on every write. Applies to all endpoints:
  notifications, messages, requests, analytics.

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:

```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

### Testing the Messaging System

**Step 1 — Log in as Collaborator**
```
POST /api/auth/login
{ "email": "sarah.johnson@ey.local", "password": "Dev1234!" }
```

**Step 2 — Send a message on a request you own**
```
POST /api/requests/{id}/messages
Authorization: Bearer <collaborator-token>
{ "content": "Can you confirm the pickup time?" }
```

**Step 3 — Read the thread**
```
GET /api/requests/{id}/messages
Authorization: Bearer <admin-token>
```
The response is a chronological list of messages with sender name,
role, and timestamp. All participants also receive a real-time
notification badge via `/hubs/notifications` and the full message
payload on `/hubs/request-messaging`.

**Step 4 — Connect to the messaging hub (SignalR)**
```
/hubs/request-messaging?access_token=<JWT>
```
Invoke `JoinRequestGroup("{requestId}")`, then listen on
`ReceiveRequestMessage`.

## Notes

- All tests pass (`dotnet test` from the `backend` directory). The new
  integration tests cover: 201 for owner / Admin / assigned Courier,
  403 for non-participants, 401 for unauthenticated, 400 for empty
  content, 404 for missing request, chronological ordering, and full
  DTO shape validation.
- This branch includes all features from all previous branches,
  including the Courier Recommendation Engine and the real-time
  notification system.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@errands.local` | `Admin123!` |
| Collaborator | `sarah.johnson@ey.local` | `Dev1234!` |
| Collaborator | `michael.chen@ey.local` | `Dev1234!` |
| Courier | `courier1@ey.local` | `Dev1234!` |
| Courier | `courier2@ey.local` | `Dev1234!` |