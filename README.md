#  Errands Management App

This branch reorganizes the repository into a monorepo structure and initializes the frontend project.

## What’s Changed

- **Backend** – All backend code (API, Application, Domain, Infrastructure) moved into `backend/` folder.  
  - Docker setup for backend + database remains inside `backend/` (for standalone testing).
- **Frontend** – A new Vite + React + TypeScript project scaffold in `frontend/`.  
  - Includes Tailwind CSS, shadcn/ui, React Query, Axios, and basic folder structure.
  - Frontend is **not yet connected** to the backend – it’s just a foundation.
- **Root Docker Compose** – A new `docker-compose.yml` at the root that starts both backend and frontend together, plus the database.

## How to Test the Full Stack

1. Ensure Docker Desktop is running.
2. From the repository root, run:
   ```bash
   docker-compose up --build
   ```
3. Access 
  - **Backend API**: `http://localhost:5000`
  - **Frontend app**: `http://localhost:3000`
4. The frontend is a placeholder – no actual features yet.
   
## Notes 
- This branch does not add any new backend functionality; it only moves existing code and adds the frontend scaffold.

- All backend features from previous branches are preserved.

- The frontend is not yet integrated with the API – that will come in future PRs.