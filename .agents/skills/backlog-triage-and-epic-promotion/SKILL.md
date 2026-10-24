---
name: backlog-triage-and-epic-promotion
description: Use when triaging docs/backlog.md, deciding standalone Brief vs Epic, or routing scope drift discovered during active work.
---

# Backlog Triage and Work Promotion

Primary file: `docs/backlog.md`.

## Routing

When new work appears:

1. Fits the current Brief/Phase scope → absorb it there.
2. Belongs to the same Epic but a later slice → keep it in the Epic follow-up section.
3. Does not belong to the current work → add a self-contained backlog row.

Do not use `briefs/` as a parking area for undecided or Epic-owned work.

## Brief vs Epic

- Brief: narrow single work item, bounded impact, short implementation and verification.
- Epic: crosses multiple domains/layers, needs independently verifiable slices, migration sequencing, or broad integration/regression verification.

Brief and Epic are sibling containers, not lifecycle stages.

## Backlog rows

Open rows must explain the remaining problem without relying on an Epic/Phase id. Prefer a falsifiable residual signal. Delete completed rows; history belongs to Git/archive.

Use current Product/Dev SSOT and code when triaging. Do not require retired current-state inventories or capability ledgers.

## Done when

- each open row is self-contained and still true;
- the work is routed to backlog, Brief, Epic, current scope, or intentionally dropped;
- no retired document path is used as planning evidence.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; verify changed Markdown links and only run documented checks.
