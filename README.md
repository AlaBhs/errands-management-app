# Errands Management App

This branch adds a **Physical Delivery Tracking System** — an operational layer
that lets admins register batches of physical items prepared for a client, hand
them off to reception, and lets reception confirm the final pickup — with full
traceability, real-time notifications, and signed proof at every step.

## What's New — `feature/physical-delivery-tracking`

### Creating a Delivery Batch (Admin)

- On the **Delivery Batches** page, an Admin sees a **"New Batch"** button in
  the top-right corner
- Clicking it opens a creation form where the admin enters a batch title, the
  client's name, an optional phone number, and any pickup instructions for
  reception
- Once submitted, the batch appears in the list with a **Created** status,
  ready for handover

### Handing Over to Reception (Admin)

- On any batch detail page, the admin sees a **"Hand Over to Reception"**
  button when the batch is in the **Created** state
- Clicking it opens a confirmation modal — one click records the handover with
  the exact timestamp and the admin's identity
- The batch status moves to **At Reception** and all reception users receive a
  real-time notification instantly

### Confirming a Pickup (Reception)

- Reception users see a dedicated **Deliveries** section in their sidebar with
  only the batches relevant to them
- On a batch detail page, a reception user sees a **"Confirm Pickup"** button
  when the batch is **At Reception**
- A small modal lets them optionally record the name of the person who collected
  the items — useful for audit purposes
- Once confirmed, the batch moves to **Picked Up** and the admin who created it
  receives a real-time notification

### Pickup Proof Attachments (Reception)

- After confirming a pickup, reception can upload photo evidence or a signed
  document directly on the detail page
- Only image files (JPEG, PNG, WEBP) up to 10 MB are accepted — up to 3 files
  per batch
- Admins can view uploaded proof on the same detail page in read-only mode


### User Management — Reception Role

- Admins can now create **Reception** accounts from the User Management page
- The role appears in the role dropdown and is displayed with its own colour
  badge throughout the interface
- Two reception accounts are pre-seeded in the database for immediate testing


## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:

```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

### Testing the Delivery Flow

**Step 1 — Create a batch**

Log in as an Admin. Navigate to **Deliveries** in the sidebar and click
**New Batch**. Fill in a title and client name, then submit.

**Step 2 — Hand it over**

Open the batch you just created and click **Hand Over to Reception**. Confirm
in the modal. The status changes to **At Reception** and reception users receive
a notification.

**Step 3 — Confirm pickup as Reception**

Log in as a reception user (see credentials below). The notification appears
in the bell — clicking it takes you straight to the batch. Click
**Confirm Pickup**, optionally enter the collector's name, and confirm.

**Step 4 — Upload proof**

Still on the detail page as a reception user, scroll to the **Pickup Proof**
section and upload a photo. The admin can see it on their view of the same page.

**Step 5 — Check the admin notification**

Switch back to the admin account. A notification confirms that the batch was
picked up. The batch list shows the **Picked Up** status immediately.

**Step 6 — Try cancellation**

Create a second batch, hand it over, then log in as reception and use the
**Cancel** button. Add a reason — it is recorded on the detail page.

## Notes

- This branch includes all features from all previous branches, including the
  Deadline Risk Alerting System, Request Messaging System, Courier Recommendation
  Engine, Request Expense Tracking System, and the real-time notification system.
- The delivery tracking system is entirely separate from the request system —
  no existing data or workflow is affected.

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