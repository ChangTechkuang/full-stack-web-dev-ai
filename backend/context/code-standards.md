# Code Standards

## Architecture rule

Use layered architecture:

- Controller Layer
- Service Layer
- Repository Layer
- Domain Layer
- Infrastructure Layer

Rules:

- Controllers only handle HTTP
- Services contain business logic
- Repositories handle persistence
- DTOs handle request/response
- Entities represent domain models

Never:

- Put business logic in controllers
- Return entities directly
- Access DB directly from controllers
- Mix infrastructure into domain logic

## Database rule

1. Use UUID primary keys
2. Add audit fields
3. Add proper indexing
4. Use migrations
5. Avoid N+1 queries
6. Use transactions correctly
7. Normalize properly
8. Use soft delete only when needed

Base fields:

- id
- created_at
- updated_at
- created_by
- updated_by
- version

Use:
- Flyway migrations

Never:
- Auto-update schema in production
- Use SELECT *
- Ignore query performance

## API design rule

REST Standards:

GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/{id}
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}

Rules:
1. Version APIs
2. Use consistent response structure
3. Add pagination
4. Add filtering/sorting
5. Add validation
6. Use proper HTTP status codes
7. Document APIs

Standard Response:

Success:

{
  "success": true,
  "data": {},
  "meta": {}
}

Error:

{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}

## DATABASE MODULE STRUCTURE

src/main/resources/db/migration/
├── V1__init_schema.sql
...

## RESTRICTIONS

- Do NOT use poor naming
- Do NOT skip indexes
- Do NOT skip constraints
- Do NOT overuse JSON fields
- Do NOT ignore scalability
- Do NOT create weak relationships
- Do NOT store sensitive data insecurely
- Do NOT use auto schema updates in production