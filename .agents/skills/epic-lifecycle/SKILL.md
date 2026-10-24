---
name: epic-lifecycle
description: Use when creating, synchronizing, closing, or archiving an Epic under docs/epic. Owns Epic document lifecycle only.
---

# Epic Lifecycle

Epic is the container for work that crosses multiple domains/layers and needs staged migration plus broad verification.

## Layout

```text
docs/epic/E##.YYYY-MM-DD_<epic-name>/
  Readme.md
  P##.<phase-name>.md

docs/epic/archive/E##.YYYY-MM-DD_<epic-name>/
```

For numbering, scan both active Epic and archive directories.

## Epic contract

Epic `Readme.md` owns goals, current problem/context, durable constraints, Phase list, follow-up, and Phase status. Each Phase owns an independently verifiable slice, approved design, executable tasks, acceptance, and evidence.

Product meaning stays in `docs/product/**`; technical invariants stay in `docs/dev/**`; implemented state is verified from code. Do not require or recreate retired capability/current-state inventories.

Do not create a parallel standalone Brief for an Epic-owned Phase.

## Lifecycle

- Create: establish Epic and at least the first Phase.
- Synchronize: only check Phase/Epic status after inspecting implementation and verification evidence.
- Closeout: reconcile changed Product/Dev SSOT, remove temporary work, classify remaining findings, and verify Epic goals.
- Archive: only on an explicit `/co` request (which supplies user approval); move the whole Epic folder to `docs/epic/archive/` and record the archive date. Archiving an incomplete Epic is allowed only with its unfinished acceptance and risk explicitly preserved; archival is not completion evidence.

Discoveries outside Epic goals route through `backlog-triage-and-epic-promotion` to `docs/workflow/backlog.md`.

## Done when

The requested lifecycle state matches inspected evidence, no status is overstated, and active SSOT contains only the resulting durable rules.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; run `npm run check:dev-docs` before claiming the documentation slice complete.

## Templates

When authoring a new Epic or Phase, use `docs/templates/epic-readme.md` and `docs/templates/epic-phase.md` as optional starting shapes; the skill's lifecycle and acceptance contract takes precedence. Do not create a separate templates skill.
