#  Errands Management App

This branch connects the frontend to the backend, providing a complete user interface for managing requests. It builds on all previous backend features and adds the following frontend functionality.

## Key Features

- **Backend**
  - Added CORS policy with configurable allowed origins (to allow frontend access).
  - (All previous backend features remain intact.)

- **Frontend**
  - **Layout**: Main layout with sidebar (navigation), topbar, and placeholder pages for Dashboard, Courier, Analytics, Admin.
  - **Requests Pages**:
    - List page with sorting, filtering (by status), and pagination.
    - Details page showing request information and related data.
    - Create page matching backend `CreateRequestCommand`.
  - **Request Actions**: Buttons to assign, start, cancel, complete, and submit survey (with conditional rendering based on status).
  - **API Integration**:
    - React Query hooks for fetching and mutating requests.
    - Axios client with error handling and type guards (`isApiError`).
    - Vite proxy configured for local API development (`/api` → `http://localhost:5000`).
  - **Type Safety**: All frontend types aligned with backend API contracts.

## How to Test with Docker (Full Stack)

1. Ensure Docker Desktop is running.
2. From the repository root, start all services:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
- **Frontend**: `http://localhost:3000`

- **Backend API**: `http://localhost:5000` (or via proxy at /api)

4. The frontend will communicate with the backend through the proxy, so no additional CORS issues.

## Notes
- Pages like Dashboard, Courier, Analytics and Admin are all placeholders for now.

- The frontend is now integrated and ready for user testing. Please verify the main flows:

    - Create a request

    - View list and details

    - Perform lifecycle actions (assign, start, etc.)