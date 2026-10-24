---
name: typescript-stack
description: Use when writing or reviewing TypeScript for AI_Portfolio naming, type safety, immutability, error modeling, and module boundaries. React component and hook conventions belong to react-stack; verification lane selection and completion claims belong elsewhere.
---

# TypeScript Stack

Own TypeScript-specific code decisions.

## Naming and files

- Values and functions: `camelCase`.
- Types, interfaces, classes, enums: `PascalCase`.
- True module constants: `UPPER_SNAKE_CASE`.
- Directories: project-local `kebab-case`.
- Follow the role naming already enforced by the active frontend conventions; do not invent a second filename taxonomy.
- Keep snake_case at external serialization/DB boundaries and map it before domain/application use.

## Type safety

- Prefer narrowing, type guards, discriminated unions, and `satisfies` over assertions.
- Allow `as` only at a proven external boundary or tightly controlled test fixture.
- Do not introduce `any` when `unknown` plus validation can express the boundary.
- Use distinct generic names when scopes nest.
- Model closed branching states as unions/enums instead of unconstrained strings.

## Immutability and errors

- Default props, DTOs, and shared values to `readonly`.
- Do not mutate input arrays/objects; make ownership transfer explicit when mutation is intentional.
- Use typed error/result shapes at domain and application boundaries.
- Keep transport error mapping in adapters; do not leak UI/wire strings into core decisions.

## Composition

- Load `react-stack` for React components, hooks, accessibility, and FSD placement.
- Use `layered-tdd-workflow` only when the user explicitly requests TDD; tests are otherwise written at merge hardening.
- Use `test-selection-and-verification` for target/fast/full lane selection.
- Use `evidence-before-completion` for success claims.

## Done when

- Touched TypeScript follows the type, ownership, naming, and boundary rules above.
- Verification and completion remain delegated to their owning skills.
