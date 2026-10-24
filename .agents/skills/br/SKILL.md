---
name: br
description: Use only when the user explicitly invokes BR or br to discuss and author or materially revise a standalone Brief. Do not use when an active epic Phase owns the work, to implement the Brief, or to mark work complete.
---

# BR — Brief Authoring

> AI_Portfolio migration note: Follow `docs/dev/development.md` and the actual repository build/test scripts for verification timing and commands. ClipPro-only examples (Tauri, Rust, Cargo, pnpm, IPC, SQLite, local media) are not applicable unless directly evidenced in AI_Portfolio. Backend/API, auth, PostgreSQL, cloud and browser boundaries take precedence when relevant. Any references to uncreated workflow docs are transitional and do not authorize inventing content.

Turn an explicit `/br` or `$br` request into one executable Brief without duplicating an epic Phase.

A Brief is a bounded single work item that can be implemented and verified in a short cycle. It does not follow the epic's strict Phase workflow, and it is not a smaller lifecycle stage of an epic — Brief and Epic are sibling containers.

## Workflow

1. Inspect active epics, relevant product/dev SSOT, current code boundaries, and `docs/workflow/briefs/README.md`.
2. If an active epic Phase owns the slice, stop and route the request to `ep`; do not create a parallel Brief.
3. If the work crosses multiple domains/layers or needs multiple staged slices, route to `ep`.
4. When the approach is unsettled, use `creative-design-brainstorm` and obtain approval before writing Tasks.
5. Use `implementation-plan-authoring` to create or revise `docs/workflow/briefs/YYYY-MM-DD-<topic>.md`.
6. Use `test-selection-and-verification` to name the work-stage closeout checks: affected-stack `check` and `build` only. Do not launch the app or use browser tools to observe behavior; until beta, running-app observation belongs to the user's `## 사용자 검증` lane. Do not author test-writing Tasks or require test lanes; automated write or run tests during implementation when justified by the change; use the repository verification policy.
7. For any fact only observable in the running app — interaction flow, real-browser stacking, cascade, layout geometry, appearance — author a `## 사용자 검증` section: a debug-scenario URL, the measured readout to observe, and the expected value, left for the user to fill in. Do not author or require a Playwright/E2E spec for it unless the user explicitly asks in that request.
8. Refresh `docs/workflow/briefs/README.md` and leave all execution and closeout statuses unchecked.

Current implementation is read from code. Do not require retired capability ledgers or current-state inventories.

## Ownership in the Brief

The Brief Design must contain **Ownership & Boundaries** as defined by `implementation-plan-authoring`: concrete changed responsibilities, existing/proposed owners, upstream authority/public contracts, consumer/adapter boundaries, and explicit unknowns. Do not prescribe a new owner merely from file placement or the first consumer. At least the Tasks that change a responsibility must verify code conformance with the recorded owner; execution uses `plan-execution-checkpoints` and revalidates the premise against current code.

## Boundaries

- Do not implement the Brief.
- Do not duplicate an epic-owned Design or Tasks.
- Do not record historical test results as current evidence.
- Do not mark Tasks complete or archive the Brief.
- Do not fill, check, or gate anything on a `## 사용자 검증` row — the user owns that lane and it never blocks closeout.
- Do not create or switch branches.

## Done when

- Exactly one Brief artifact owns the approved Design and Tasks.
- Every Task has an outcome, bounded scope, acceptance, dependencies, and verification.
- Task verification is `check`/`build` only, with no app or browser observation and no work-stage test authoring unless the user explicitly requested it.
- Facts outside the logical boundary sit in `## 사용자 검증` as scenario-addressed, measured-value rows that no Task or status item depends on.
- Unknowns and blockers are explicit and execution status remains honest.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; run `npm run check:dev-docs` before claiming the documentation slice complete.
