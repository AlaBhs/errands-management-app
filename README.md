# Errands Management App

This branch adds an **AI-Powered Operational Intelligence System** — admins can
generate on-demand reports that combine pre-aggregated platform metrics with
Gemini AI analysis, surfacing anomalies, root causes, and concrete actions
without ever exposing raw data to the model.

## What's New — `feature/ai-operations-report`

### Generating a Report (Admin)

From the **Operational Intelligence** page, an admin selects an optional date
range and clicks **Generate Report**. The system pulls pre-aggregated metrics
from the database, sends a structured plain-text summary to Gemini, and stores
the result as an immutable report. If the AI call fails, the report is still
saved with the full metrics intact.

A 5-minute idempotency window prevents duplicate reports — clicking generate
twice within that window returns the existing report instead of creating a new
one.

### Shortcut from Analytics (Admin)

On the **Analytics** page, a **Generate Report** button appears in the header
next to the live stats. Clicking it navigates directly to the Operational
Intelligence page with the current date range pre-filled, so the admin never
has to re-enter dates they are already looking at.

### Browsing Past Reports

The left sidebar on the Operational Intelligence page lists all past reports,
newest first. Each item shows the generation date, the period it covers, and a
green **AI** badge or a grey **No AI** badge depending on whether AI analysis
was available. Clicking any report loads its full detail instantly.

### Report Detail

Each report detail view shows six KPI cards across two rows:

- Total Requests (completed vs open breakdown)
- Deadline Compliance (with on-track / needs attention / critical indicator)
- Avg Survey Rating (with satisfaction label)
- Actual Cost vs Estimated Cost (in TND)
- Avg Execution Time
- Avg Queue Wait (flags a bottleneck if queue exceeds execution time)

### AI Analysis Section

When AI analysis is available, the report shows four panels:

- **Highlights** — two positive results worth acknowledging to the team
- **Anomalies** — three metric outliers or imbalances flagged by the model
- **Possible Causes** — one hypothesis per anomaly, grounded in the data
- **Recommended Actions** — three numbered, specific actions the manager can
  take this week, referencing courier names, category names, and exact figures

If AI analysis was unavailable at generation time, a notice is shown and the
metrics remain fully accessible.

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:

```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

### Testing the Flow

**Step 1 — Generate from Analytics**

Log in as Admin. Navigate to **Analytics** and set a date range using the
filter bar. Click **Generate Report** in the page header — you land on the
Operational Intelligence page with the range pre-filled.

**Step 2 — Generate the report**

Click **Generate Report**. The button shows a spinner while the system fetches
metrics and calls Gemini. The new report appears in the sidebar and is selected
automatically.

**Step 3 — Review the KPIs**

Check the six metric cards. The queue wait card will highlight a bottleneck in
amber if average queue time exceeds average execution time.

**Step 4 — Review the AI analysis**

Read through the Highlights, Anomalies, Causes, and Actions panels. All
monetary values are in TND. Actions reference specific courier names and
categories from the actual data.

**Step 5 — Browse past reports**

Generate a second report with a different date range. Both appear in the
sidebar. Switching between them loads each report's stored analysis without
making a new AI call.

**Step 6 — Test AI unavailability**

Remove the Gemini API key from user secrets and generate a report. The report
saves successfully and shows the "AI analysis unavailable" notice while all
metric cards remain populated.

## Notes

- This branch includes all features from all previous branches.
- The AI model never receives raw entity data — only pre-aggregated summaries
  computed by the existing analytics layer.
- Reports are immutable once generated. The AI analysis and metrics snapshot
  stored on a report never change after creation.
- The Gemini API key is stored in .NET user secrets locally and as an
  environment variable in production — never committed to source control.

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