---
name: br
description: Use only when the user explicitly invokes BR or br to discuss and author or materially revise a standalone Brief. Do not use when an active epic Phase owns the work, to implement the Brief, or to mark work complete.
---

# BR — Brief Authoring

Turn an explicit `/br` or `$br` request into one executable Brief without duplicating an epic Phase.

A Brief is a bounded single work item that can be implemented and verified in a short cycle. It does not follow the epic's strict Phase workflow, and it is not a smaller lifecycle stage of an epic — Brief and Epic are sibling containers.

## Workflow

1. Inspect active Epic directories (excluding archive), relevant Product/Dev SSOT, current code boundaries, and the Brief writing rules at `docs/workflow/briefs/README.md`. Do not browse archived briefs or epics unless explicitly requested.
2. If an active epic Phase owns the slice, stop and route the request to `ep`; do not create a parallel Brief.
3. If the work crosses multiple domains/layers or needs multiple staged slices, route to `ep`.
4. When the approach is unsettled, use `creative-design-brainstorm` and obtain approval before writing Tasks.
5. Use `implementation-plan-authoring` to create or revise `docs/workflow/briefs/YYYY-MM-DD-<topic>.md`.
6. Use `test-selection-and-verification` to specify acceptance-specific tests, build, integrations and browser checks where appropriate; record gaps as unverified.
7. For UI/runtime acceptance provide reproducible scenarios and execute browser observation where available; otherwise record a user-verification lane without claiming completion.
8. Do not add entries, completed lists, or status summaries to `docs/workflow/briefs/README.md`. The presence of the Brief file is the active inventory. Leave implementation and closeout statuses unchecked.

Current implementation is read from code. Do not require retired capability ledgers or current-state inventories.

## Ownership in the Brief

The Brief Design must contain **Ownership & Boundaries** as defined by `implementation-plan-authoring`: concrete changed responsibilities, existing/proposed owners, upstream authority/public contracts, consumer/adapter boundaries, and explicit unknowns. Do not prescribe a new owner merely from file placement or the first consumer. At least the Tasks that change a responsibility must verify code conformance with the recorded owner; execution uses `plan-execution-checkpoints` and revalidates the premise against current code.

## Boundaries

- Do not implement the Brief.
- Do not duplicate an epic-owned Design or Tasks.
- Do not record historical test results as current evidence.
- Do not mark Tasks complete or archive the Brief.
- Do not mark user-owned observations complete without user evidence; missing required acceptance is unverified.
- Do not create or switch branches.

## Done when

- Exactly one Brief artifact owns the approved Design and Tasks.
- Every Task has an outcome, bounded scope, acceptance, dependencies, and verification.
- Each Task selects verification proportionate to its risk, including regression tests and actual UI checks when warranted.
- User-only observations are explicitly separated from agent-run checks and never fabricated.
- Unknowns and blockers are explicit and execution status remains honest.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; verify changed Markdown links and only run documented checks.
