# Errands Management App

This branch adds a **Deadline Risk Alerting System** — a background feature that
automatically monitors active requests and sends real-time alerts to all relevant
participants when a request is approaching its deadline, with full integration
into the existing notification pipeline.

## What's New — `feature/deadline-risk-alerting`

### Proactive Deadline Monitoring
- A background job runs **every 5 minutes** and scans all active requests
- Requests are flagged as **at risk** when their remaining time falls within a
  calculated threshold based on their total duration
- Alerts are sent to all relevant participants automatically — no manual action needed
- Each request receives **at most one alert per lifecycle** — no duplicate notifications

### Risk Detection Rules
A request is considered at risk when all of the following are true:

- Status is **Assigned** or **InProgress**
- Has a deadline set
- Deadline has **not yet passed**
- Has **not already been alerted**
- Remaining time is within `MAX(20% of total duration, 2 hours)`

For example, a request with a 20-hour total duration gets alerted when 4 hours
remain. A short 1-hour request gets alerted immediately since the 2-hour floor
kicks in.

### Who Gets Notified
Every alert fans out to all participants of the request:

| Recipient | Condition |
|---|---|
| **Admin(s)** | Always |
| **Collaborator** (request owner) | Always |
| **Courier** | Only if one is assigned |

### Notification Content
Alerts use a new dedicated `DeadlineRisk` notification type. The message is
timezone-neutral — the deadline is delivered as structured ISO 8601 UTC metadata
alongside the message, so the frontend can render it in each user's local timezone
automatically.

### New API Behavior
No new endpoints are added. Alerts flow entirely through the existing notification
pipeline — they appear in the notification bell like any other notification and
are pushed live via SignalR to all connected participants.

### Architecture

```
Domain/
├── Entities/
│   └── Request.cs                  ← +LastRiskAlertAt, +MarkRiskAlertSent()
├── Enums/
│   └── NotificationType.cs         ← +DeadlineRisk = 7
└── Events/
    └── RequestAtRiskEvent.cs

Application/
└── Requests/
    ├── Queries/    GetAtRiskRequestsQuery
    ├── Commands/   MarkRequestRiskAlertSentCommand
    └── Handlers/   RequestAtRiskHandler

Infrastructure/
├── BackgroundJobs/   DeadlineMonitoringService
├── Repositories/     RequestRepository  ← +GetAtRiskRequestsAsync
├── Configurations/   RequestConfiguration  ← +LastRiskAlertAt mapping
└── Migrations/       AddLastRiskAlertAtToRequest
```

The background job contains zero business logic — it only schedules and delegates
to the Application layer via MediatR. All detection and notification logic lives
in the Application layer, strictly respecting Clean Architecture boundaries.

### Database Changes
A single nullable column `LastRiskAlertAt` is added to the `Requests` table. It
is `NULL` by default, meaning all existing requests are eligible for a one-time
alert. Once an alert is sent, the column is stamped and the request is excluded
from all future scans.

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:

```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

### Testing the Alerting System

The seeded data includes a test request designed to enter the risk window
shortly after startup.

**Step 1 — Log in and open the notification panel**

Log in as Admin or as the Collaborator `sarah.johnson@ey.local`. Watch the
notification bell — an alert will appear within the first two scan cycles
(within 5 minutes of startup).

**Step 2 — Watch the background job logs**

In the Docker console you will see:
```
[DeadlineMonitor] Scanning for at-risk requests at ...
[DeadlineMonitor] Found 1 at-risk request(s).
```

**Step 3 — Verify the notification**

The alert appears in the notification feed for Admin, the request owner, and
the assigned Courier. Each recipient receives it independently and gets a live
push via SignalR.

**Step 4 — Verify idempotency**

On the next scan cycle the log will show:
```
[DeadlineMonitor] Found 0 at-risk request(s).
```
The same request is never alerted twice.

## Notes

- This branch includes all features from all previous branches, including the
  Request Messaging System, Courier Recommendation Engine, and the real-time
  notification system.
- The background job starts with a 15-second delay after app startup to let
  the host finish wiring up before the first scan.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@errands.local` | `Admin123!` |
| Collaborator | `sarah.johnson@ey.local` | `Dev1234!` |
| Collaborator | `michael.chen@ey.local` | `Dev1234!` |
| Courier | `courier1@ey.local` | `Dev1234!` |
| Courier | `courier2@ey.local` | `Dev1234!` |