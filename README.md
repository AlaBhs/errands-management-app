# Errands Management App

This branch adds a **System Configuration and User Preferences System** — admins
control all operational parameters from a UI backed by a database with full
change history, and every user gets a persistent preferences profile stored
server-side instead of in localStorage.

## What's New — `feature/system-configuration`

### System Configuration (Admin)

From the **System Settings** page, an admin manages five independent policy
sections. Each section saves independently and every change is logged with the
identity of the admin who made it.

- **Recommendation Engine** — weights for normal and urgent priority scoring,
  max active assignments per courier, and max scoring distance. The three
  weights per priority tier must sum to 1.0 — the UI enforces this live and
  disables Save until both sets are valid.
- **SLA & Deadlines** — the risk threshold percentage, how often the monitoring
  job scans, and the cooldown between repeat alerts for the same request.
- **Expense Policy** — a budget cap per request category and an overrun flag
  threshold percentage.
- **Notification Policy** — a matrix of notification types against roles. Turning
  a cell off means that role never receives that type, overriding any individual
  user preference.
- **Request Rules** — which categories are active, whether a contact person is
  required, and the minimum deadline advance in hours.

### Change History

A read-only paginated log under the **Change History** tab. Each row shows when
a change was made, which policy section was affected, and which admin made it.
Filterable by section.

### User Preferences (All Roles)

Every user has a **My Preferences** page. Preferences are stored in the database
and synced across devices.

- **General** — language, theme, and default view.
- **Notifications** — opt out of any notification type the system still allows
  for your role. Types the admin has disabled are not shown.
- **Request Defaults** *(Collaborator only)* — default category, priority,
  contact person, and phone. Pre-filled in the Create Request form.
- **Courier Defaults** *(Courier only)* — base location via map picker, max
  concurrent assignments, available days and hours. Saving the base location
  immediately updates the courier's profile used by the recommendation engine.

## How to Run

### With Docker (recommended)

Ensure Docker Desktop is running, then from the repository root:

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000 |
| API explorer (Scalar) | http://localhost:5000/scalar |

### Without Docker

```bash
# Terminal 1 — API
cd backend/ErrandsManagement.API
dotnet run

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

## How to Test

### Step 1 — System configuration

Log in as Admin and navigate to **System Settings** in the sidebar.

### Step 2 — Recommendation weights

Open the **Recommendation Engine** tab. Adjust the priority weight sliders and
observe the live sum indicator. The Save button stays disabled until both weight
groups sum to 1.0.

### Step 3 — Notification Policy matrix

Open the **Notification Policy** tab. Turn off a notification type for a role,
save, then trigger that event as a user of that role and confirm no notification
is received.

### Step 4 — Collaborator defaults

Log in as a Collaborator. Go to **My Preferences** and set a default category
and priority under **Request Defaults**. Open **Create Request** — both fields
should be pre-filled.

### Step 5 — Courier base location

Log in as a Courier. Go to **My Preferences** and set a base location on the
map. Save. Trigger a courier recommendation as Admin — the courier's proximity
score reflects the new location.

### Step 6 — Notification opt-out

In **My Preferences**, toggle off a notification type. Trigger the corresponding
event and confirm the notification is not received.

### Step 7 — Request Rules

In **System Settings → Request Rules**, disable a category and increase the
minimum deadline advance. Log in as a Collaborator and open **Create Request**
— the disabled category is absent from the dropdown and the deadline picker
enforces the new minimum.

### Step 8 — Change History

After making several changes across different sections, open the **Change
History** tab and confirm each change appears with the correct section and
timestamp. Use the section filter to narrow the list.

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

## Notes

- This branch includes all features from all previous branches.
- The system configuration is a singleton — seeded from `appsettings.json` on
  first startup. There is no create endpoint, only five update endpoints.
- `GET /api/me/preferences` never returns a 404 — it returns sensible defaults
  if the user has not saved preferences yet.
- The notification gate (system policy + user opt-out) is checked in every
  notification handler before a notification is created or dispatched.