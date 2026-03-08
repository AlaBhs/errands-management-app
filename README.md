#  Errands Management App

This branch implements the foundational request creation and retrieval functionality.

## Key Features

- **Domain Layer**  
  - Base entity, enums, and `Address` value object  
  - `User` entity with role and activation control  
  - Request aggregate with lifecycle business rules  
  - Domain‑specific exceptions

- **Infrastructure Layer**  
  - Entity Framework Core integration with SQL Server  
  - `RequestRepository` with `GetAllAsync`  
  - Database migrations

- **Application Layer**  
  - `CreateRequest` use case  
  - `GetRequestById` query and handler

- **API Layer**  
  - `POST /api/requests` endpoint  
  - Global exception handling middleware

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root, start the backend and database:
   ```bash
   docker-compose up --build
   ```
3. The API will be available at `http://localhost:5000`.

## Domain Enhancements 
  - `POST /api/requests` – Create a new request 
  - `GET /api/requests/{id}` – Get a request by ID (to be implemented later in other branches)

## Notes 
  - The frontend is not yet functional in this branch – only the backend is ready.
  - Database migrations are applied automatically on startup

