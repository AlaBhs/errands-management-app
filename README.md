# Errands Management App

This branch adds a **Request Expense Tracking System** — a financial layer on top
of the existing request lifecycle that allows admins to record cash advances given
to couriers, track categorized expenses per request, and formally reconcile the
financial outcome once a request is complete.

## What's New — `feature/request-expense-tracking`

### Cash Advance Management
- Admin can set a **cash advance** amount for a courier when a request is in the
  Assigned state
- The advanced amount is recorded once and cannot be modified — ensuring a clear
  and auditable financial record
- Visible directly on the request detail page alongside the assignment information

### Expense Recording
- Admin can add **multiple expense entries** to any active or completed request
- Each entry has a **category** (Transport, Purchase, or Other), an amount, and
  an optional description
- Entries can be removed before reconciliation if a mistake was made
- Expenses can still be added after the request is completed — supporting
  real-world scenarios where receipts arrive late

### Automatic Financial Summary
The system computes the financial outcome in real time without any manual
calculation:

| Field | Meaning |
|---|---|
| **Advanced Amount** | Cash given to the courier upfront |
| **Total Expenses** | Sum of all recorded expense entries |
| **Difference** | Total Expenses − Advanced Amount |

The difference tells the admin exactly what action to take:

- **Positive** → the organisation owes the courier the difference
- **Negative** → the courier returns money to the organisation
- **Zero** → balanced, no transfer needed

### Reconciliation
- Once the admin has reviewed the summary, they can **mark the request as
  reconciled** with a single action
- Reconciliation is only available when an advanced amount has been set
- After reconciliation the expense panel becomes fully read-only — no further
  edits are possible
- The reconciliation timestamp is recorded and displayed on the request

### Non-Blocking Design
Expense tracking is entirely **optional and non-blocking**. A request can be
assigned, started, completed, and surveyed without ever touching the finances
section. The feature sits as a parallel layer and never interferes with the
request lifecycle.

### Who Can Use It
The Finances section is **Admin-only**. Couriers and Collaborators do not see
expense data on the request detail page.

### New API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/requests/{id}/expenses/advanced-amount` | Set the cash advance |
| `GET` | `/requests/{id}/expenses` | List all expense records |
| `POST` | `/requests/{id}/expenses` | Add an expense entry |
| `DELETE` | `/requests/{id}/expenses/{expenseId}` | Remove an expense entry |
| `GET` | `/requests/{id}/expenses/summary` | Get the financial summary |
| `POST` | `/requests/{id}/expenses/reconcile` | Mark as reconciled |

The financial summary is also embedded directly in the existing
`GET /requests/{id}` response, so the request detail page loads everything in
a single call.

### Database Changes
Two nullable columns are added to the `Assignments` table (`AdvancedAmount`,
`ReconciledAt`) and a new `ExpenseRecords` table is created, linked to both the
request and its assignment. All existing data is unaffected.

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:

```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

### Testing the Expense Tracking Flow

**Step 1 — Assign a request and set an advance**

Log in as Admin, open any Pending request, and assign a courier. Once the
status becomes Assigned, the **Finances** section appears in the right column.
Enter a cash advance amount and click **Set**.

**Step 2 — Add expenses**

Add one or more expense entries using the category selector and amount field.
The summary updates immediately after each entry. Try adding a Transport and a
Purchase entry to see the difference calculation in action.

**Step 3 — Remove an entry**

Click the trash icon on any expense row to remove it. The summary recalculates
automatically.

**Step 4 — Reconcile**

Once you are satisfied with the entries, click **Mark as Reconciled**. The panel
becomes read-only, the reconciliation timestamp is displayed, and the Reconciled
badge appears in the section header.

**Step 5 — Verify the audit trail**

Scroll down to the **Activity** timeline on the request detail page. Each
financial action — setting the advance, adding or removing expenses, and
reconciliation — appears as a timestamped entry in the timeline.

## Notes

- This branch includes all features from all previous branches, including the
  Deadline Risk Alerting System, Request Messaging System, Courier Recommendation
  Engine, and the real-time notification system.
- Expense records are append-only by design — each entry is independent and
  there is no edit operation, only add and remove.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@errands.local` | `Admin123!` |
| Collaborator | `sarah.johnson@ey.local` | `Dev1234!` |
| Collaborator | `michael.chen@ey.local` | `Dev1234!` |
| Courier | `courier1@ey.local` | `Dev1234!` |
| Courier | `courier2@ey.local` | `Dev1234!` |