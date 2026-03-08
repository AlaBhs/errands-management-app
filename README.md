#  Errands Management App

This branch adds full request lifecycle management: assign, start, cancel, complete, and submit survey.

## Key Features

- **Domain Enhancements**  
  - Strengthened `Assignment` lifecycle  
  - Simplified `RequestStatus` (removed Failed state)

- **Application Layer**  
  - Commands and handlers for:  
    - Assign request  
    - Start request  
    - Cancel request  
    - Complete request  
    - Submit survey  
  - `GetAllRequests` query  
  - Projection‑based `GetRequestById` with enriched read model  
  - FluentValidation integration and structured error responses  
  - Custom exception handling

- **Infrastructure Layer**  
  - Fixed EF Core tracking issues  
  - Enabled SQL logging for debugging

- **API Layer**  
  - Endpoints for all lifecycle actions  
  - Improved exception middleware

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root, start the backend and database:
   ```bash
   docker-compose up --build
   ```
3. The API will be available at `http://localhost:5000`. Use tools like Scalar to test the new endpoints (already integrated) at `http://localhost:5000/scalar`.

## Domain Enhancements 
  - `POST /api/requests` – Create a new request 

  - `GET /api/requests` – List all requests (pagination comes later)
  
  - `GET /api/requests/{id}` – Get detailed request info

  - `POST /api/requests/{id}/assign` – Assign request

  - `POST /api/requests/{id}/start` – Start request

  - `POST /api/requests/{id}/cancel` – Cancel request

  - `POST /api/requests/{id}/complete` – Complete request

  - `POST /api/requests/{id}/survey` – Submit survey

## Notes 
  - The frontend is not yet connected – testing is via API tools (scalar).
  - This branch includes all features from feature/request-creation (including Docker).