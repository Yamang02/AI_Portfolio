# Development documentation

Own durable technical responsibility, technical boundaries, contracts, conventions, and verification guidance.

## Find the owner

| Subject | Canonical route |
|---|---|
| Cross-stack coding rules | [conventions.md](./conventions.md) |
| Frontend / Main / Admin / Profile | [frontend/README.md](./frontend/README.md) → [frontend conventions](./frontend/conventions.md) |
| Java / Spring Boot / API / DB | [backend/README.md](./backend/README.md) → [backend conventions](./backend/conventions.md) |
| Commands, verification, runtime setup | [development.md](./development.md) |
| Existing detailed technical evidence | [technical/](../technical/README.md) |
| Local SonarQube policy | [quality basis](../basis/quality/SQ-01-local-sonarqube-workflow.md) |

## Reading and authority

1. Relevant [Product](../product/README.md) meaning or approved workflow design.
2. This router → relevant Frontend/Backend subject authority.
3. Existing technical documents where they contain still-applicable contracts.
4. Actual implementation, consumers, configuration and test evidence.

Product owns user-visible meaning, Dev owns durable technical rules, Workflow owns active changes, and code shows what is implemented. Do not reproduce the same requirement in several authorities.

## Migration

`docs/technical/` remains a legacy detailed reference pending subject-by-subject review. Newly adopted conventions in `docs/dev/frontend/` and `docs/dev/backend/` supersede conflicting general advice in old coding-principles files, but **do not silently override code or unreviewed stable subsystem contracts**.

`docs/basis/quality/` retains SonarQube policy. No new template-writing or convention-enforcement skill is required solely because these directories exist.
