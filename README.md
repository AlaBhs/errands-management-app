#  Errands Management App

This branch introduces a comprehensive test suite across all layers.

## Key Features

- **Unit Tests**  
  - Domain: Request aggregate business rules  
  - Application: Handlers, validators, query parameters, pagination

- **Integration Tests**  
  - Infrastructure: `RequestRepository` using in‑memory SQLite

- **Test Utilities**  
  - `RequestBuilder` for easy test data creation

- **Test Projects**  
  - Separate projects for domain, application, and infrastructure layers

## How to Run Tests

You can run tests locally with:
```bash
dotnet test
```

## Notes 
  - This branch includes all previous features.
  - Tests are designed to be fast and isolated.