# Backend development

Backend technical authority for `backend/` (Java 17, Spring Boot, Maven).

## Reading route
1. [Common conventions](../conventions.md)
2. [Backend conventions](./conventions.md)
3. Existing [backend architecture](../../technical/architecture/backend-architecture-guide.md), [backend coding principles](../../technical/guides/backend/coding-principles.md), [identifier guide](../../technical/guides/identifier-usage-guide.md), and [API specification](../../technical/api-spec.yml) as needed.
4. Actual domain/application/infrastructure Java code, Maven configuration, schema and migrations.
5. [Repository commands](../development.md).

## Responsibilities
- Domain, application and infrastructure dependency boundaries
- Ports/use cases, persistence, transactions, API and DTO contracts
- Auth/session, integration and cache invariants
- Migration and compatibility rules

Do not treat dated implementation examples in legacy guides as code truth. In particular, verify caching behavior from code and active project decisions before endorsing a Spring Cache annotation pattern.
