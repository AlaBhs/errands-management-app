# Errands Management App

This branch adds a **Request Template System** — a productivity layer that lets
collaborators capture the reusable details of any existing request as a named
template, then use that template to pre-fill the creation form for future
requests — eliminating repetitive manual input.

## What's New — `feature/request-templates`

### Saving a Template from a Request

- On any request detail page, a collaborator who owns the request sees a
  **"Save as Template"** button in the top-right corner of the header
- Clicking it opens a small modal where the collaborator gives the template a name
- The system captures all the reusable fields — title, description, category,
  address, estimated cost, contact person, and contact phone — and saves them as
  a private template
- Dynamic fields that belong to a specific instance of a request are deliberately
  excluded: deadline, status, assignment, and timestamps are never stored

### Using a Template to Create a Request

- On the **Create Request** page, a template picker appears above the form
- The collaborator can search through their templates by name and select one from
  the dropdown
- The form is instantly pre-filled with all the saved values
- Every field remains editable — the collaborator can adjust anything before
  submitting, and sets the deadline and other instance-specific fields as usual
- Clearing the picker resets the form back to blank

### My Templates Page

- A dedicated **My Templates** page (`/templates`) lists all templates saved by
  the collaborator
- Templates are displayed as cards showing the name, title, category, estimated
  cost, and the date they were saved
- The page supports **search by name** and **pagination**
- Each card has a delete button (revealed on hover) — a confirmation prompt
  appears before the template is permanently removed

### Privacy and Rules

- Templates are **private** — a collaborator can only see and use their own
  templates, never another user's
- Template names must be **unique per user** — the system rejects a duplicate
  name with a clear error message
- Templates are **immutable** — once saved, a template cannot be edited, only
  deleted and recreated
- Only Collaborators can create, view, and use templates. Admins and Couriers do
  not have access to this feature

### Non-Blocking Design

Templates are entirely optional. The existing request creation flow works
exactly as before — the template picker is an enhancement, not a requirement.
No existing data or workflow is affected by this feature.

### New API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/request-templates` | Save a template from an existing request |
| `GET` | `/api/request-templates` | List my templates (searchable, paginated) |
| `GET` | `/api/request-templates/{id}` | Get full template details |
| `DELETE` | `/api/request-templates/{id}` | Delete a template |

### Database Changes

A new `RequestTemplates` table is created. It stores all reusable fields inline
alongside a composite unique index on `(UserId, Name)` that enforces the
per-user name uniqueness rule at the database level. The address is stored as
embedded columns, identical to how request addresses are stored. No existing
tables are modified.

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:

```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

### Testing the Template Flow

**Step 1 — Create a template from a request**

Log in as a Collaborator, open any request you own, and look for the
**"Save as Template"** button in the top-right corner of the request header.
Click it, type a name for the template, and click **Save Template**.

**Step 2 — View your templates**

Navigate to **My Templates** in the sidebar. The template you just saved should
appear as a card. Try the search bar to filter by name.

**Step 3 — Use the template on a new request**

Navigate to **Create Request**. At the top of the form, click the
**"Use a template to pre-fill the form…"** picker and select your template. All
saved fields — title, description, category, address, estimated cost, and contact
details — are filled in automatically.

**Step 4 — Adjust and submit**

Modify any field as needed, set the deadline, then submit the request as normal.
The submitted request has no connection to the template — editing or deleting the
template later has no effect on requests already created from it.

**Step 5 — Delete a template**

Go back to **My Templates**, hover over a card, and click the trash icon.
Confirm the deletion in the prompt that appears.

## Notes

- This branch includes all features from all previous branches, including the
  Deadline Risk Alerting System, Request Messaging System, Courier Recommendation
  Engine, Request Expense Tracking System, and the real-time notification system.
- Templates capture contact person and contact phone from the source request,
  so those fields are also pre-filled when a template is applied.
- Attempting to save two templates with the same name returns a
  **409 Conflict** error with a clear message.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@errands.local` | `Admin123!` |
| Collaborator | `sarah.johnson@ey.local` | `Dev1234!` |
| Collaborator | `michael.chen@ey.local` | `Dev1234!` |
| Courier | `courier1@ey.local` | `Dev1234!` |
| Courier | `courier2@ey.local` | `Dev1234!` |