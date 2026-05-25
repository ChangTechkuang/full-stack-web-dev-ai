# Architecture Context

## Stack

**Framework**

- Spring Boot

**Langauge**

- Java 17

**Build**

- Gradle

**Database**

- PostgreSQL

Use:
- Flyway migrations

**ORM**
- Spring Data JPA

**Security**

- Spring Security
- JWT Authentication

**Validation**
- Jakarta Validation

**API Documentation:
- Swagger

**Caching**
- Redis (Skip)

**Queue**
- RabbitMQ (Skip)

**Storage**
- AWS S3 (Skip)

**Containerization**
- Docker (Skip)

## Engineering rule

1. Use production-grade architecture
2. Follow SOLID principles
3. Use clean architecture
4. Separate layers properly
5. Keep services modular
6. Avoid duplicated logic
7. Add proper validation
8. Add centralized error handling
9. Optimize performance
10. Apply security best practices

## Performance role

1. Use pagination
2. Optimize queries
3. Add caching
4. Use connection pooling
5. Avoid unnecessary serialization
6. Use async processing when appropriate
7. Optimize DB indexes
8. Prevent memory leaks

## Security Rule

1. Use JWT authentication
2. Add refresh token flow
3. Use role-based access control
4. Validate all inputs
5. Prevent SQL injection
6. Prevent XSS
7. Prevent CSRF where applicable
8. Use rate limiting
9. Secure password hashing
10. Never expose sensitive data

Use:
- BCryptPasswordEncoder

Never:
- Store plain passwords
- Hardcode secrets
- Expose stack traces
- Trust client input