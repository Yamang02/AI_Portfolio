---
name: refactoring-workflow
description: Use when changing code structure without intended observable behavior change. Defines the behavior-preservation boundary and safe change sequence; do not use when the requested outcome intentionally changes behavior.
---

# Refactoring Workflow

Own behavior-preserving structural change discipline.

## Process

1. Define observable behavior that must remain equivalent: outputs, errors, API surfaces, side effects, persisted data, and performance constraints that are contractual.
2. Establish a behavior-preservation safety net with existing or new characterization tests and compile/static or browser checks where appropriate.
3. Make one structural intent at a time: rename, extract, move, dependency inversion, then verify.
4. If persistence shape changes, use `database-schema-design` for expand/migrate/switch/contract order.
5. If new required behavior appears, stop treating it as a refactor and return to design/planning.
6. If the current-state premise is wrong, update the active Brief/Phase and route out-of-scope work through backlog triage.
7. Use stack skills for language/framework details and `test-selection-and-verification` for canonical checks.

## Done when

- Preserved behavior is explicit and still evidenced.
- Structural steps remain reviewable and no feature behavior is hidden inside the refactor.
- Schema or out-of-scope findings were handed to their owning workflow.
