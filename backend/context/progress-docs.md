# Progress

Snapshot of the backend implementation against the goals in `project-overview.md`,
`architecture-context.md`, and `code-standards.md`.

Last updated: 2026-05-25

## Status

Phase 1 backend scaffold complete. All in-scope APIs are implemented and the
service boots against a local PostgreSQL instance with Flyway-managed schema.

## Stack Implemented

- Spring Boot 3.3.x on Java 17, Gradle build
- Spring Data JPA, Hibernate 6, HikariCP pool
- PostgreSQL with Flyway migrations (`V1__init_schema.sql`)
- Spring Security + JWT (jjwt 0.12) with BCrypt password hashing
- Jakarta Validation
- springdoc-openapi (Swagger UI)
- Lombok

Skipped per the architecture doc: Redis, RabbitMQ, S3, Docker.

## Project Layout

```
backend/
├─ build.gradle, settings.gradle, gradle.properties
└─ src/main/
   ├─ java/com/kosign/taskflow/
   │  ├─ TaskFlowApplication.java
   │  ├─ common/
   │  │  ├─ api/         ApiResponse, ApiError, ApiMeta
   │  │  ├─ config/      OpenApiConfig
   │  │  ├─ error/       ErrorCode, AppException, GlobalExceptionHandler
   │  │  ├─ persistence/ BaseEntity, JpaAuditingConfig
   │  │  └─ seed/        SeedProperties, DefaultUserSeeder
   │  ├─ security/       SecurityConfig, JwtTokenProvider,
   │  │                  JwtAuthenticationFilter, RestAuthEntryPoint,
   │  │                  RestAccessDeniedHandler, AuthenticatedUser,
   │  │                  UserDetailsServiceImpl, @CurrentUser
   │  ├─ auth/           domain/ dto/ repository/ service/ controller/
   │  ├─ user/           domain/ dto/ repository/ controller/
   │  └─ workrequest/    domain/ dto/ repository/ service/ controller/
   └─ resources/
      ├─ application.yml
      └─ db/migration/V1__init_schema.sql
```

## Database

Tables: `users`, `refresh_tokens`, `work_requests`.

- UUID primary keys (`gen_random_uuid()` via `pgcrypto`)
- Base audit columns on every table: `created_at`, `updated_at`,
  `created_by`, `updated_by`, `version`
- `CHECK` constraints on `users.role`, `work_requests.status`,
  `work_requests.priority`
- Indexes on filter fields: status, priority, assignee_id, requester_id,
  created_at DESC, refresh_tokens.expires_at

JPA auditing is wired (`JpaAuditingConfig`) so `created_by` / `updated_by`
auto-populate from the authenticated principal.

## Features Delivered

### Authentication
- `POST /api/v1/auth/register` — creates a user, returns access + refresh tokens
- `POST /api/v1/auth/login` — credential exchange via `AuthenticationManager`
- `POST /api/v1/auth/refresh` — token rotation; old refresh token revoked
- `POST /api/v1/auth/logout` — revokes a refresh token
- Access tokens: HS256 JWT, 15 min default, issuer-validated, `typ=access` claim
- Refresh tokens: opaque random (48 bytes, base64url), **stored as SHA-256 hash
  in `refresh_tokens` table** so they are revocable and rotatable
- Role-based access control via Spring authorities (`ROLE_EMPLOYEE`, `ROLE_MANAGER`)
- Stateless session, CORS open for development

### Work Request Management
- `GET    /api/v1/work-requests` — paged list with filters
- `GET    /api/v1/work-requests/{id}` — detail
- `POST   /api/v1/work-requests` — submit
- `PUT    /api/v1/work-requests/{id}` — update
- `PATCH  /api/v1/work-requests/{id}/status` — change status (managers only)
- `DELETE /api/v1/work-requests/{id}` — delete (manager, or owner while PENDING)

### Workflow / Status
Statuses: `PENDING`, `IN_PROGRESS`, `DONE`, `REJECTED`.

Allowed transitions (enforced server-side in `RequestStatus.canTransitionTo`):

```
PENDING     → IN_PROGRESS, REJECTED
IN_PROGRESS → DONE, REJECTED
DONE        → (terminal)
REJECTED    → (terminal)
```

Illegal transitions return `409 ILLEGAL_STATUS_TRANSITION`.

### Filtering & Search
Query params on `GET /api/v1/work-requests`:

| Param        | Notes                                                          |
| ------------ | -------------------------------------------------------------- |
| `status`     | enum filter                                                    |
| `priority`   | enum filter                                                    |
| `assigneeId` | UUID filter                                                    |
| `search`     | case-insensitive `like` over `title` / `description`           |
| `page,size`  | standard pageable                                              |
| `sort`       | e.g. `sort=createdAt,desc` (default), also `priority`, `title` |

Employees only see requests where they are requester or assignee; managers
see everything. Implemented via JPA Criteria specs in
`WorkRequestSpecifications`.

### Users
- `GET /api/v1/users/me` — returns the authenticated user

### Cross-cutting
- Standardized response envelope (`ApiResponse<T>`) with optional `meta` for pagination
- Centralized error handling (`GlobalExceptionHandler`) returns
  `{ success: false, error: { code, message, details } }`
- Bean-validation messages surface in `error.details[]`
- Swagger UI served at `/swagger-ui.html` with Bearer-JWT security scheme
- Default user seeder (`DefaultUserSeeder`) creates a manager + employee
  at startup if absent — idempotent, env-overridable, can be disabled

## Defaults & Run

```bash
# 1. Generate the wrapper once
cd backend
gradle wrapper --gradle-version 8.10

# 2. Start Postgres (default db name: taskflowdb)
# 3. Boot
./gradlew bootRun
```

Swagger UI: http://localhost:8080/swagger-ui.html

Seeded users (override via env vars in production):

| Role     | Email                       | Password       |
| -------- | --------------------------- | -------------- |
| MANAGER  | `manager@taskflow.local`    | `Manager@123`  |
| EMPLOYEE | `employee@taskflow.local`   | `Employee@123` |

## Recent Refactors

- **JWT diagnostics (2026-05-25):** `JwtTokenProvider` now distinguishes
  `SignatureException` / `MalformedJwtException` / `ExpiredJwtException` /
  `MissingClaimException` / `IncorrectClaimException` with specific error
  messages and WARN-level logs.
- **`Authorization` header tolerance:** `JwtAuthenticationFilter.resolveToken`
  is case-insensitive on the `Bearer` scheme and strips repeated `Bearer `
  prefixes — fixes the common Swagger UI pitfall where users paste
  `Bearer <token>` into the auth dialog.
- **Targeted token-claim errors:** invalid subject UUID, missing role,
  unknown role each now return their own message instead of a generic
  `Invalid token`.

## Compliance Against Standards

| Rule                                             | Status |
| ------------------------------------------------ | :----: |
| Layered architecture (controller/service/repo)   | done   |
| Controllers do not contain business logic        | done   |
| Entities never returned directly                 | done   |
| UUID primary keys                                | done   |
| Base audit fields on every entity                | done   |
| Flyway migrations (no `ddl-auto: update`)        | done   |
| Proper indexing of filter columns                | done   |
| Centralized error handling                       | done   |
| Bean validation on all DTOs                      | done   |
| Pagination on list endpoints                     | done   |
| API versioning (`/api/v1`)                       | done   |
| Standard success / error response shape          | done   |
| JWT + refresh + RBAC + BCrypt                    | done   |
| No plain passwords, no hardcoded secrets         | done   |
| Stack traces never exposed                       | done   |

## Not Yet Implemented / Out of Scope

- Rate limiting (security rule #8) — not yet added
- Comments / attachments / activity log on work requests
- Manager-driven user management endpoints (list / disable users)
- Integration tests (`@SpringBootTest`) — no test classes yet
- Production profile / secrets management
- CI pipeline

## Open Questions / Decisions to Confirm

1. Should employees be allowed to **edit** their request after submission but
   only while it is `PENDING`? Current implementation: yes — managers can edit
   any time.
2. Should `DELETE` be soft-delete? Current: hard delete. Code standards says
   "soft delete only when needed" — sticking with hard delete unless audit
   requirements appear.
3. Reassignment policy: only managers can change `assigneeId` today. Confirm
   whether employees should be able to self-claim unassigned requests.
