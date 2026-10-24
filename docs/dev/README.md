# Development documentation

Own durable technical responsibility, technical boundaries, contracts, conventions, and verification guidance.

## Find the owner

| Subject | Canonical route |
|---|---|
| Cross-stack coding rules | [conventions.md](./conventions.md) |
| Frontend / Main / Admin / Profile | [frontend/README.md](./frontend/README.md) → [frontend conventions](./frontend/conventions.md) |
| Java / Spring Boot / API / DB | [backend/README.md](./backend/README.md) → [backend conventions](./backend/conventions.md) |
| Commands, verification, runtime setup | [development.md](./development.md) |
| Technical references and historical material | [technical/](../technical/README.md) |
| Local SonarQube policy | [quality basis](../basis/quality/SQ-01-local-sonarqube-workflow.md) |

## Reading and authority

1. Relevant [Product](../product/README.md) meaning or approved workflow design.
2. This router → relevant Frontend/Backend subject authority.
3. [Technical references](../technical/README.md) for context, examples, past designs, and operational records; do not treat them as current normative policy.
4. Actual implementation, consumers, configuration and test evidence.

Product owns user-visible meaning, Dev owns durable technical rules, Workflow owns active changes, and code shows what is implemented. Do not reproduce the same requirement in several authorities.

## Technical references

`docs/technical/` is a retained reference library, not a migration queue. Keep its technical explanations, past proposals, snapshots, and operations notes in place. [Technical README](../technical/README.md) classifies the material. Current conventions live in `docs/dev/`; verify implemented behavior and subsystem contracts against code rather than inferring them from historic examples.

`docs/basis/quality/` retains SonarQube policy. No new template-writing or convention-enforcement skill is required solely because these directories exist.
