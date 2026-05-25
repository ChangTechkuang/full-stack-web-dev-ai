# TaskFlow

Internal work-request management system. Employees submit requests, managers
drive them through a status workflow. Built as a full-stack reference for
AI-assisted development workflows with Claude Code.

## Stack

| Layer    | Tech                                                                |
| -------- | ------------------------------------------------------------------- |
| Backend  | Spring Boot 3.3, Java 17, Gradle, Spring Security, JPA, PostgreSQL, Flyway, jjwt, springdoc-openapi |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind v4, TanStack Query, shadcn-style UI primitives |
| Database | PostgreSQL 14+                                                      |
| Build    | `gradle` (backend), `npm` (frontend)                                |

## Repository layout

```
task-flow-dev/
├── backend/                 Spring Boot service
│   ├── src/main/java/com/kosign/taskflow/
│   │   ├── auth/            register / login / refresh / logout
│   │   ├── user/            user entity + /users/me
│   │   ├── workrequest/     CRUD, filtering, status workflow
│   │   ├── security/        JWT filter, security config, RBAC
│   │   └── common/          api envelope, error handling, auditing, seeder
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/V1__init_schema.sql
│   └── context/             architecture / standards / progress docs
└── frontend/                Next.js app
    ├── src/
    │   ├── app/             routes: (auth) login/register, (app) dashboard/requests
    │   ├── widgets/         header, requests-table
    │   ├── features/        auth, work-requests (api + hooks + ui)
    │   ├── entities/        user, work-request domain types + badges
    │   └── shared/          api client, ui primitives, lib helpers
    └── context/             architecture / standards / UI docs
```

## Features

- JWT authentication with rotating refresh tokens (DB-persisted, revocable)
- Role-based authorization: `EMPLOYEE` / `MANAGER`
- Work request CRUD with title, description, priority, assignee, due date
- Status workflow enforced server-side: `PENDING → IN_PROGRESS → DONE`,
  with `REJECTED` reachable from `PENDING` or `IN_PROGRESS`
- Filtering by status / priority / assignee + paginated list
- Search across title / description
- Dark mode toggle, skeleton loading, empty + error states
- Standardized API response envelope and centralized error handling
- Swagger UI for live API exploration

## Prerequisites

- Java 17
- Node.js 18+
- PostgreSQL 14+ running on `localhost:5432`
- A database called `taskflowdb` (or override `DB_URL`)

## Backend — Getting started

```powershell
cd backend

# Create the database (one-time)
# psql -U postgres -c "CREATE DATABASE taskflowdb;"

# Run the service
./gradlew bootRun
```

The service starts on `http://localhost:8080`.

- Swagger UI: <http://localhost:8080/swagger-ui.html>
- Health: <http://localhost:8080/actuator/health>

Flyway creates the schema on first boot. A startup seeder inserts two default
users if they do not yet exist:

| Role     | Email                       | Password       |
| -------- | --------------------------- | -------------- |
| MANAGER  | `manager@taskflow.local`    | `Manager@123`  |
| EMPLOYEE | `employee@taskflow.local`   | `Employee@123` |

### Environment overrides

| Variable                      | Default                              | Purpose                       |
| ----------------------------- | ------------------------------------ | ----------------------------- |
| `DB_URL`                      | `jdbc:postgresql://localhost:5432/taskflowdb` | JDBC URL              |
| `DB_USERNAME`                 | `postgres`                           | DB user                       |
| `DB_PASSWORD`                 | (dev default in `application.yml`)   | DB password                   |
| `JWT_SECRET`                  | dev placeholder                      | HS256 signing key (≥ 32 bytes)|
| `JWT_ACCESS_EXP_MS`           | `900000` (15 min)                    | Access token TTL              |
| `JWT_REFRESH_EXP_MS`          | `1209600000` (14 days)               | Refresh token TTL             |
| `APP_SEED_ENABLED`            | `true`                               | Disable seed in production    |
| `SEED_MANAGER_EMAIL/PASSWORD` | see table above                      | Override seeded manager       |
| `SEED_EMPLOYEE_EMAIL/PASSWORD`| see table above                      | Override seeded employee      |

## Frontend — Getting started

```powershell
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:3000` and proxies API calls to the
backend at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8080`).

Set it explicitly in `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Sign in with the seeded manager or employee from the table above.

## API surface

| Endpoint                                  | Method | Auth     | Description                          |
| ----------------------------------------- | ------ | -------- | ------------------------------------ |
| `/api/v1/auth/register`                   | POST   | public   | Create account, returns tokens       |
| `/api/v1/auth/login`                      | POST   | public   | Exchange credentials for tokens      |
| `/api/v1/auth/refresh`                    | POST   | public   | Rotate refresh + issue new access    |
| `/api/v1/auth/logout`                     | POST   | public   | Revoke a refresh token               |
| `/api/v1/users/me`                        | GET    | bearer   | Current user                         |
| `/api/v1/work-requests`                   | GET    | bearer   | Paged list with filters              |
| `/api/v1/work-requests`                   | POST   | bearer   | Create work request                  |
| `/api/v1/work-requests/{id}`              | GET    | bearer   | Detail                               |
| `/api/v1/work-requests/{id}`              | PUT    | bearer   | Update                               |
| `/api/v1/work-requests/{id}/status`       | PATCH  | MANAGER  | Change status                        |
| `/api/v1/work-requests/{id}`              | DELETE | bearer   | Delete (manager, or owner if PENDING)|

All responses follow:

```json
{ "success": true,  "data": { ... },         "meta": { ... } }
{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }
```

## Status workflow

```
PENDING ──► IN_PROGRESS ──► DONE
   │             │
   ▼             ▼
REJECTED      REJECTED
```

`DONE` and `REJECTED` are terminal. Illegal transitions return
`409 ILLEGAL_STATUS_TRANSITION`.

## Engineering rules

- Layered architecture on the backend; Feature-Sliced Design on the frontend
- DTOs, not entities, at the API boundary
- UUID primary keys + audit columns (`created_at`, `updated_at`, `created_by`,
  `updated_by`, `version`) on every table
- Centralized exception handler returns the standard envelope
- Tokens never logged; passwords hashed with BCrypt
- Frontend never hardcodes API URLs — all calls go through `shared/api/client.ts`
- No raw Tailwind colors — only theme tokens defined in `globals.css`

## What's not yet built

- Rate limiting on auth endpoints
- Manager-driven user list endpoint (frontend assignee picker is a UUID input)
- Integration tests
- Production profile / secrets management
- CI pipeline

See [`backend/context/progress-docs.md`](backend/context/progress-docs.md)
for the running implementation log.

## License

Internal — not published.
