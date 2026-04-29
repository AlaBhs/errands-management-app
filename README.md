# Errands Management App

This branch delivers an **Actual Cost Reconciliation System** — `ActualCost`
moves from a manual guess made at completion time to a locked, auditable value
derived automatically from expense records at reconciliation time.

## What's Refactored — `refactor/finance-standardization`

### The Core Insight

`ActualCost` was being set at the wrong moment (completion) by the wrong person
(whoever clicks complete). It is now set at the right moment (reconciliation)
from the right data source (expense records). The field itself doesn't disappear
— it becomes a locked, auditable confirmation rather than a manual guess.

### Reconciling a Request (Admin)

- On any completed request's detail page, an Admin sees a **"Mark Reconciled"**
  button once all expense records have been entered
- Clicking it sums every attached expense record and writes the total into
  `ActualCost` automatically — no manual input required
- The field is then locked and the request status moves to **Reconciled**

### Locked Actual Cost Field

- Once reconciled, `ActualCost` is immutable and displayed in read-only mode
  throughout the interface
- Any request that already carried a manually entered `ActualCost` keeps its
  original value — legacy data is fully preserved

### Analytics — Reconciled Cost Reporting

- The analytics dashboard now sources cost figures from reconciled expense
  records rather than manually entered values
- All existing filters, date ranges, and per-collaborator breakdowns reflect
  the updated data source automatically


## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:

```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

### Testing the Reconciliation Flow

**Step 1 — Complete a request**

Log in as an Admin. Open any in-progress request and mark it as complete.

**Step 2 — Add expense records**

Navigate to the **Expenses** section of the same request and add one or more
expense records until the expected costs are fully captured.

**Step 3 — Reconcile**

Click **Mark Reconciled**. The system sums all attached expense records, writes
the total to `ActualCost`, and locks the field. The status updates to
**Reconciled** immediately.

**Step 4 — Verify the lock**

Confirm that `ActualCost` is now read-only and displays the calculated total.

**Step 5 — Check analytics**

Navigate to the **Analytics** dashboard and verify that cost figures reflect
the expense records rather than any previously entered manual value.

## Notes

- This branch includes all features from all previous branches, including the
  Deadline Risk Alerting System, Request Messaging System, Courier
  Recommendation Engine, Request Expense Tracking System, and the Physical
  Delivery Tracking System.
- The reconciliation change is backwards-compatible — no existing request,
  expense record, or delivery batch is affected.

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