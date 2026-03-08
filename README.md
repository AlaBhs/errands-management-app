#  Errands Management App

This branch standardizes API responses and introduces reusable pagination, filtering, and sorting.

## Key Features

- **Unified API Response Contract**  
  Consistent `ApiResponse<T>` envelope for all endpoints

- **Pagination & Filtering Abstraction**  
  Reusable query parameters for pagination, filtering, sorting, and validation  
  Applies to all collection‑returning endpoints (e.g., `GET /api/requests`)

- **Improved Error Handling**  
  Structured, machine‑readable error responses

## How to Test with Docker

1. Start the backend as usual:
   ```bash
   docker-compose up --build
   ```
2. The API will be available at `http://localhost:5000`. Use tools like Scalar to test at `http://localhost:5000/scalar`.

3. Call `GET /api/requests` with query parameters like `?page=1&pageSize=10&sortBy=createdAt`. Observe the paginated response format.

## Example Response 
```
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [...],
    "totalCount": 42,
    "page": 1,
    "pageSize": 10
  },
  "traceId": "..."
}
```
## Notes 
  - This branch includes all features from previous branches (creation + status management).
  - All previous endpoints now return responses in this unified format.