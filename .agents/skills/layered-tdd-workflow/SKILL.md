---
name: layered-tdd-workflow
description: Use when the user explicitly requests a fail-first TDD workflow. TDD is optional; ordinary regression tests may be written during implementation without invoking this skill.
---

# Layered TDD Workflow

Own the fail-first loop when the user **explicitly requests TDD**. General test authoring can happen during implementation when useful; this skill does not control that timing.

## Applicability

Use fail-first only when:

- The user explicitly requests TDD or fail-first tests for this change.

Risk level, Domain/Application scope, persistence/recovery/concurrency/security contracts, and bug fixes do not trigger this skill by themselves. Select tests matching the changed contract with `test-selection-and-verification`; no universal TDD rule applies. Unit tests are not mandatory merely because a function is pure; fail-first is not required there.

For behavior-preserving refactors, use existing safety nets through `refactoring-workflow`.

## Cycle

1. Identify one observable behavior and its layer boundary.
2. Add the smallest test that fails because the behavior is absent or wrong.
3. Run it and confirm the expected failure reason.
4. Make the smallest production change that satisfies the behavior.
5. Run the target and confirm it passes.
6. Refactor while keeping the target green.
7. Use `test-selection-and-verification` for appropriate tests, builds, integrations and browser checks.

Test behavior, not private implementation details:

- Domain: pure unit tests.
- Application: fake ports and observable use-case results.
- Infrastructure/PostgreSQL/Redis/HTTP: integration tests at relevant adapter boundaries.
- UI logical behavior: component tests for DOM semantics, accessibility, keyboard/focus transitions, and state outcomes; use E2E only when the logical behavior requires a real browser or built application.

Visual appearance is not a TDD target. Do not create fail-first tests for screenshots, pixel diffs, computed styles, actual layout geometry, paint order, stacking, cascade, or hover/focus appearance.

## Exceptions

- Generated or configuration-only changes may be TDD N/A; record the direct verification instead.

## Done when

- The requested behavior has fail-first and passing evidence for the right reason.
- Broader suite selection is delegated to `test-selection-and-verification`.
