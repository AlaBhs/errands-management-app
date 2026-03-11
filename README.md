# Errands Management App

This branch fixes and completes the test suite following the JWT authentication
merge. All 122 tests pass with 0 failures.

## What's New in This Branch

### Tests Added

- **Application Unit Tests** — handler tests for `CreateRequest` and
  `GetRequestById`, validator tests for `RegisterUser`, and auth handler
  tests for login, refresh, logout, and register.

- **Infrastructure Integration Tests** — full `UserRepository` coverage
  including refresh token lifecycle (add, revoke, revoke all, expiry).

- **API Integration Tests** — auth endpoints end-to-end, and a full request
  lifecycle suite covering all endpoints from assign through survey with
  happy path and error cases.

### Why Some Tests Were Deliberately Not Written

- **`CancelRequestHandler`, `CompleteRequestHandler`, `StartRequestHandler`,
  `SubmitSurveyHandler`** — same pattern as the already-tested
  `AssignRequestHandler`. Domain logic covered by `RequestTests.cs`,
  persistence by `RequestRepositoryTests.cs`.

- **`GetAllRequestsHandler`** — single-line delegation to the repository,
  already covered by `RequestRepositoryTests.cs`.

- **`LoginUserValidator`, `RefreshTokenValidator`, `LogoutValidator`** —
  four trivial rules total, already exercised by the auth integration tests.

## How to Run the Tests

From the `backend` directory:

```bash
dotnet test
```

Expected output:

```
Test summary: total: 122, failed: 0, succeeded: 122, skipped: 0
```

## Previous Branch

See the previous README for the full JWT authentication feature description,
Docker setup, default credentials, and manual testing steps with Scalar.