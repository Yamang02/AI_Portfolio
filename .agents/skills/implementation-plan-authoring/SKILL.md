---
name: implementation-plan-authoring
description: Use after a design is approved or requirements are clear when work needs executable Tasks, acceptance checks, and verification. Do not use to execute Tasks or mark work complete.
---

# Implementation Plan Authoring

Own the transition from approved design to executable Tasks.

## Choose one container

| Container | Use |
|---|---|
| `docs/epic/.../P##.*.md` | An active Epic Phase owns the slice |
| `docs/workflow/briefs/YYYY-MM-DD-<topic>.md` | Narrow standalone work |
| `docs/backlog.md` | Work is not ready to plan |

Never create a Brief that duplicates an Epic Phase.

## Task contract

Each Task states outcome, bounded scope, acceptance, verification, and blocking dependencies.

Name the verification commands with `test-selection-and-verification` rather than inventing an ad hoc check list per Task. Verification may include tests, builds, integrations and browser checks based on the changed contracts.

Use Product/Dev SSOT for durable meaning and invariants. Inspect code for current implementation and actual paths. Do not require a manually maintained capability/current-state ledger.

For standalone work, prefer one coherent Plan. If the proposed work grows across multiple domains/layers or needs independently verifiable migration slices, stop expanding the Plan and route it to Epic triage.

## Ownership & boundaries

Every Brief Design and executable Epic Phase must include a compact **Ownership & Boundaries** section before Tasks. Identify only responsibilities the planned change creates, relocates, or composes; do not copy a project-wide owner inventory.

For each material responsibility, state: **responsibility/guarantee**, **existing or proposed owner and ownership dimension** (policy, state instance, mechanics, data, composition, or presentation as relevant), **upstream Product/Dev authority or existing public contract**, and **consumer/adapter boundary**. Mark an unverified owner or library gap as an open decision instead of treating a proposal as authoritative. Frontend owner resolution uses actual code and `docs/dev/frontend/conventions.md`.

Use this minimal section shape in the Brief or Phase (omit irrelevant ownership dimensions):

```md
## Ownership & Boundaries

| Responsibility / guarantee | Owner (dimension) | Authority / public contract | Consumer / adapter boundary |
|---|---|---|---|
| <changed responsibility> | <existing or proposed owner; mark unverified> | <Product/Dev link or public API evidence> | <who composes it; verified exception if needed> |

Open ownership questions: <none, or specific unresolved evidence/decision>.
```

Tasks that change such responsibilities must include acceptance requiring implementation to conform to the recorded owner and public contract, without duplicating library/native or upstream responsibilities. Execution must re-check the actual code and current SSOT; planned ownership is not proof and may be corrected in the owning Plan before implementation. Do not require an ownership row for pure copy/style changes, and do not turn Workflow into permanent architecture authority.

## SSOT consistency check

Before finalizing Tasks, check the planned change against `docs/product/**` and `docs/dev/**`. If implementing it would leave either doc inconsistent — contradicts a stated promise or invariant, or requires one that does not yet exist — add an explicit Task in this Plan to update that doc alongside the code change. Do not defer the update to `docs/backlog.md` or a follow-up Plan.

## Status honesty

New Tasks remain unchecked. Historical test results are not current evidence. Completion is updated only by execution after inspecting artifacts and verification.

Active Brief inventory is directory membership; do not maintain a manual list in README.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; verify changed Markdown links and only run documented checks.

## Templates

When authoring a new Epic or Phase, use `docs/templates/epic-readme.md` and `docs/templates/epic-phase.md` as optional starting shapes; the skill's lifecycle and acceptance contract takes precedence. Do not create a separate templates skill.
