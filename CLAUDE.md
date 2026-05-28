Before generating any code, analysis, architecture, refactor, migration, API design, UI implementation, database schema, or recommendation:

1. Always read and follow:
   - CLAUDE.md
   - /context/*
   - existing project structure
   - existing naming conventions
   - existing architectural boundaries
   
2. Treat project context as highest priority source of truth.

3. Never generate code that conflicts with:
   - architecture standards
   - folder boundaries
   - naming conventions
   - API standards
   - security rules
   - shared component strategy
   
4. Reuse existing:
   - utilities
   - shared modules
   - hooks
   - services
   - DTOs
   - components
   before creating new implementations.
   
5. Always analyze current implementation before suggesting refactors.

6. Follow project architecture exactly:
   - Frontend = feature-based architecture
   - Backend = layered architecture
   - API = REST + response envelope
   - Authentication = JWT
   
7. Prioritize:
   - maintainability
   - scalability
   - modularity
   - production-grade practices
   - clean architecture

8. If context is missing or ambiguous:
   - ask for clarification
   - do not assume architecture decisions.