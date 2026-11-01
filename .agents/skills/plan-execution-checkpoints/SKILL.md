---
name: plan-execution-checkpoints
description: Use when executing a written Epic Phase or standalone Brief. Implement Tasks, inspect acceptance evidence, and keep document status honest.
---

# Plan Execution with Checkpoints

## Start

1. Read the whole Phase or Brief and relevant current files.
2. Confirm each Task has outcome, scope, acceptance, verification, and dependencies.
3. Read Product/Dev SSOT for durable rules and code for current implementation.
4. Repair small drift in the owning artifact before continuing.

Do not require retired capability ledgers or current-state inventories.

## Ownership conformance checkpoint

Before executing a Task that adds or relocates responsibility, read its Brief/Phase **Ownership & Boundaries** and compare the claimed owner with current Product/Dev authority, existing public contracts, native/library capability, and code. A missing or contradicted ownership claim is a Plan gap: repair the owning artifact or stop the affected slice for a decision, rather than silently inventing a new owner.

During implementation delegate existing policy/state/mechanics/execution to its established owner. After implementation inspect the changed diff and call sites against the planned responsibility and owner; record any deviation, verified exception, or unresolved gap before marking the Task complete. Keep this check proportional to the changed responsibility, not as a project-wide audit or a mandatory additional report.

## Execute each Task

1. Implement within scope.
2. Run affected tests, builds, integration and browser checks as required by acceptance; record unavailable checks.
3. Inspect the actual diff/artifact against every acceptance item.
4. Apply completion evidence rules.
5. Only then mark the Task complete; otherwise keep it unchecked and record the remaining condition.

## Execution Finalization

- remove temporary code, stale imports, logs, and TODOs introduced by the slice;
- classify remaining findings as fix-now, defer-with-risk, or promote-to-backlog;
- update Product/Dev SSOT required for correctness of the implemented change alongside code, without copying implementation inventories; `/co` owns final reconciliation and archival;
- route out-of-scope work to `docs/backlog.md`;
- for an Epic Phase, hand status synchronization to `epic-lifecycle`;
- for a standalone Brief, record evidence-based completion status without archiving; archival is performed only by an explicit `/co` request, which also preserves unfinished or unverified items honestly.

Implementation evidence includes inspected code and actually executed relevant tests/builds/runtime checks, with user observations separately attributed.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; verify changed Markdown links and only run documented checks.
