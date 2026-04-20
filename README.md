# Errands Management App

This branch adds a **Courier Recommendation Engine** — when an admin is
about to assign a pending request, the system scores and ranks all
available couriers using availability, proximity, and performance data,
and presents a transparent breakdown so the admin can make an informed
decision. The final assignment remains a manual admin action.

## What's New — `feature/courier-recommendation`

### Courier Location — User Profile Extension
- Three new fields on `ApplicationUser`: `Latitude` (`double?`),
  `Longitude` (`double?`), `City` (`string?`)
- New endpoint `PUT /api/users/me/location` — any authenticated user
  can update their own GPS coordinates and city label
- EF Core migration `AddLocationToApplicationUser` adds the columns to
  `AspNetUsers` and `DeliveryAddress_Latitude` /
  `DeliveryAddress_Longitude` to `Requests`
- `RegisterUserCommand` accepts optional location parameters — admins
  can set courier coordinates at account creation time
- Seeded couriers carry real Tunis-area coordinates so proximity
  scoring produces meaningful results out of the box

### Delivery Address Coordinates
- `Address` value object extended with optional `Latitude` and
  `Longitude` properties
- `AddressDto` and `CreateRequestDto` accept optional coordinates —
  the frontend passes them via browser geolocation or the Leaflet map
- All three seeded delivery addresses (`tunis`, `lac`, `marsa`) carry
  real GPS coordinates for demo proximity scoring

### Scoring Model
Each courier is scored 0–100 across three independent criteria:

| Criterion | Formula | Weight — Normal | Weight — High/Urgent |
|---|---|---|---|
| Availability | `max(0, (1 − active/maxActive) × 100)` | 40% | 60% |
| Proximity | `max(0, (1 − distanceKm/maxDistance) × 100)` | 35% | 25% |
| Performance | `(normalisedRating × 0.5) + (completionRate × 0.5)` | 25% | 15% |

- Couriers with no location score **0** on proximity — they are still
  included, never excluded
- If the request has no delivery coordinates, all couriers score **50**
  on proximity (neutral, not penalised)
- New couriers with no assignment history score **50** on performance
  (neutral)
- Results are sorted descending by total score, top 10 returned

### Scoring Algorithm — Pure Domain Logic
- All scoring math lives in `Domain/ValueObjects/CourierScoring.cs` —
  a static class with zero infrastructure dependencies
- `ComputeAvailabilityScore`, `ComputeProximityScore`,
  `ComputePerformanceScore`, and `Haversine` are fully unit-testable
  with no mocks or database
- `CourierRecommendationEngine` in Infrastructure is a thin
  orchestrator — it fetches data from EF Core and delegates all
  calculations to `CourierScoring`

### Configuration
Weights and thresholds are bound from `appsettings.json` at startup.
Weights are validated on startup — the app refuses to start if any
priority group does not sum to 1.0:

```json
"RecommendationEngine": {
  "MaxActiveAssignments": 3,
  "MaxScoringDistanceKm": 20.0,
  "NormalPriority": {
    "AvailabilityWeight": 0.40,
    "ProximityWeight": 0.35,
    "PerformanceWeight": 0.25
  },
  "UrgentPriority": {
    "AvailabilityWeight": 0.60,
    "ProximityWeight": 0.25,
    "PerformanceWeight": 0.15
  }
}
```

### New API Endpoints

| Method | Route | Role | Description |
|---|---|---|---|
| `GET` | `/api/requests/{id}/candidates` | Admin | Ranked courier list with score breakdown |
| `PUT` | `/api/users/me/location` | Any authenticated | Update own GPS coordinates and city |

The existing `POST /api/requests/{id}/assign` is unchanged. The admin
calls `GET candidates` first, reviews the ranked list, then calls
`POST assign` with their chosen courier. The two calls are fully
independent — no coupling.

### Architecture

```
Domain/
└── ValueObjects/
    ├── Address.cs                  ← +Latitude?, +Longitude?
    └── CourierScoring.cs           ← pure static scoring math

Application/
└── CourierRecommendation/
    ├── DTOs/
    │   ├── CourierScoreDto.cs
    │   └── RecommendationRequest.cs
    ├── Interfaces/
    │   └── ICourierRecommendationEngine.cs
    ├── Models/
    │   └── CourierScore.cs         ← internal engine model
    ├── Queries/
    │   └── GetCourierCandidates/
    │       ├── GetCourierCandidatesQuery.cs
    │       └── GetCourierCandidatesHandler.cs
    └── Settings/
        └── RecommendationEngineSettings.cs

Infrastructure/
└── Recommendation/
    └── CourierRecommendationEngine.cs  ← EF queries + delegates to CourierScoring
```

Dependency direction is strictly one-way: Infrastructure → Application
→ Domain. The scoring algorithm has no EF Core, no HTTP, and no
infrastructure references.

### Leaflet Maps (Frontend)
Three map integrations using `react-leaflet`:

- **Register form** — interactive map for the admin to pick courier
  GPS coordinates when creating a new account; clicking the map sets
  latitude and longitude on the form
- **Create request form** — interactive map for the collaborator to
  pin the delivery address location; coordinates are submitted with
  the request and used for proximity scoring
- **Request details page** — read-only map showing the delivery
  location marker for the current request

### Recommendation Panel (Frontend)
When an Admin opens a Pending request, the courier dropdown is replaced
by a ranked candidate panel:

- Each card shows: rank badge, courier name, total score (inline next
  to name), city, distance in km, active assignment count
- Clicking the chevron expands a score breakdown — three labelled
  progress bars (availability, proximity, performance) plus average
  rating and completion rate
- Clicking a card selects it and highlights it in blue
- A summary panel appears below the list showing the selected courier's
  name and score, with a contextual assign button (`Assign Ali`)
- Score color adapts to value: green ≥ 75, amber ≥ 50, red below 50
- Loading state renders three skeleton pulses while the API call
  resolves
- `useUsers` and the courier dropdown are removed entirely — no dead
  code remains

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:

```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

### Testing the Recommendation Engine

**Step 1 — Log in as Admin**
```
POST /api/auth/login
{ "email": "admin@errands.local", "password": "Admin123!" }
```

**Step 2 — Create a request as Collaborator** (log in as Collaborator
first), then open the request details page as Admin.

**Step 3 — View candidates**
```
GET /api/requests/{id}/candidates
Authorization: Bearer <admin-token>
```
The response is a ranked list of couriers with full score breakdowns.
In the frontend, open any Pending request as Admin — the recommendation
panel loads automatically.

**Step 4 — Assign**
Select a courier from the panel and click Assign, or call:
```
POST /api/requests/{id}/assign
{ "courierId": "<guid>" }
```

### Score Calculation Example

A courier 2 km away from the delivery address, with 1 active
assignment, a 4.0 average rating, and 8 out of 10 completed — on a
Normal priority request:

```
Availability:  (1 − 1/3)  × 100        = 66.7
Proximity:     (1 − 2/20) × 100        = 90.0
Performance:   (4.0/5 × 100) × 0.5
             + (8/10 × 100) × 0.5      = 80.0

Total = 66.7 × 0.40
      + 90.0 × 0.35
      + 80.0 × 0.25
      = 26.7 + 31.5 + 20.0
      = 78.2
```

### Extending the Engine with a New Criterion

1. Add a static method to `Domain/ValueObjects/CourierScoring.cs`
2. Add a weight field to `PriorityWeights` in
   `RecommendationEngineSettings` and update `appsettings.json`
3. Update `Validate()` — weights must still sum to 1.0
4. Wire the new score in `CourierRecommendationEngine.RecommendAsync`
5. Add a unit test in `Domain.UnitTests/Scoring/CourierScoringTests.cs`

No existing code changes required — fully open/closed.

## Notes

- All 319 tests pass with 0 failures (`dotnet test` from the `backend`
  directory). The 22 new tests cover scoring algorithm unit tests,
  settings validation, handler tests, and integration tests for the
  candidates endpoint.
- This branch includes all features from all previous branches,
  including the real-time notification system from
  `feature/notifications`.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@errands.local` | `Admin123!` |
| Collaborator | `sarah.johnson@ey.local` | `Dev1234!` |
| Collaborator | `michael.chen@ey.local` | `Dev1234!` |
| Courier | `courier1@ey.local` | `Dev1234!` |
| Courier | `courier2@ey.local` | `Dev1234!` |