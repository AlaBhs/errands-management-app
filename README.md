# Errands Management App

This branch adds file attachments to requests and proof-of-delivery
photos for couriers.

## What's New — `feature/attachments`

### File Attachments
- Collaborators and Admins can attach images and PDFs (max 10 MB, 5 files per request)
- Files can be added during creation or on any active request (Pending or Assigned)
- Completed and Cancelled requests are locked from new attachments
- Images open in a lightbox, PDFs open in a new tab, both are downloadable

### Discharge Photo
- Couriers attach an optional proof-of-delivery photo when completing a request
- Submitted in the same action as marking complete — one button, one call
- Appears in the attachments section with a Discharge badge

### File Validation
Content type and file extension are cross-validated — mismatches and
missing extensions are rejected. Allowed: `.jpg` `.jpeg` `.png` `.gif`
`.webp` `.pdf` (PDF not allowed for discharge photos).

### Storage
Files are stored locally in `wwwroot/uploads/yyyy/MM/dd/` behind
`IFileStorageService` — swapping to Azure Blob requires one DI line change.
Files persist across container restarts via a named Docker volume.

## How to Test with Docker

1. Ensure Docker Desktop is running.
2. From the repository root:
```bash
docker-compose up --build
```

3. The frontend is available at `http://localhost:3000`
4. The API is available at `http://localhost:5000`. Use Scalar at
   `http://localhost:5000/scalar` to explore and test the endpoints.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@errands.local` | `Admin123!` |
| Collaborator | `sarah.johnson@ey.local` | `Dev1234!` |
| Collaborator | `michael.chen@ey.local` | `Dev1234!` |
| Courier | `courier1@ey.local` | `Dev1234!` |
| Courier | `courier2@ey.local` | `Dev1234!` |

## Notes

- All 265 tests pass with 0 failures (`dotnet test` from the `backend` directory).
- Static files at `/uploads/*` are proxied to the API via Vite in development.
- This branch includes all features from all previous branches.