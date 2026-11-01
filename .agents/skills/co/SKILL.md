---
name: co
description: Use only when the user explicitly invokes CO or co to close out and archive an existing standalone Brief or Epic. Synchronize durable documentation, preserve honest completion evidence and outstanding work, then archive the owning artifact in the same workflow. Do not use for ordinary implementation or implicit completion.
---

# CO — Closeout and Archive

User-facing, explicit archival command for a standalone Brief or whole Epic. `/imp` implements Tasks; `/co` reconciles and archives the owning work artifact. Archiving does not, by itself, prove completion.

## Resolve target and status

1. Resolve the explicitly supplied Brief or Epic from active files/directories, or an unambiguous active artifact from the conversation. Do not inspect unrelated archive content. A Phase ID resolves to its owning Epic; never archive a single Phase separately.
2. Read the complete owning Brief or Epic README and all Phase documents, relevant Product/Dev SSOT, current code, and work-stage verification records.
3. Inspect the current implementation and use `evidence-before-completion` before asserting that any Task, Brief, Phase, or Epic is complete. Do not convert unverified or incomplete items to complete merely to permit archival.
4. Distinguish `completed`, `partially completed`, and `unverified` explicitly. The user's `## 사용자 검증` lane remains separately owned and non-gating. An explicit `/co` authorizes archival even with unfinished work, provided the gaps and risks are preserved; it does not authorize a false completion claim.

## Closeout and archive

1. Perform final reconciliation of the actual result with governing Product/Dev documents. Review SSOT changes already made during `/imp`; correct omissions or drift, and update only durable semantics, invariants, contracts, and routing information supported by current implementation. Do not duplicate the implementation-stage documentation work or copy an As-Is inventory into SSOT.
2. Update the owning workflow artifact with truthful Task/Phase status, changed decisions, current evidence, known gaps, unresolved risks, and any deferred work. Route still-actionable independent work through `backlog-triage-and-epic-promotion` where appropriate; do not silently drop it.
3. Apply `dev-documentation-governance` and its required checks for material changes under `docs/dev/**`; use `test-selection-and-verification` to select other applicable documentation/structural checks. Use runtime or browser checks when required by acceptance and available; report any gaps.
4. Move a Brief from `docs/workflow/briefs/<name>.md` to `docs/epic/archive/brief/<name>.md`, or the entire Epic directory from `docs/epic/E##.*` to `docs/epic/archive/E##.*`, preserving its README and every Phase.
5. Do not update any hand-maintained active or archived index: active inventory is directory membership. Repair links explicitly needed for current navigation, without scanning or rewriting unrelated historical documents.
6. Inspect the resulting moved files and diff. Confirm the source is no longer active, the archive is readable, links/indexes resolve, and archived completion wording matches evidence. Report the archive location, documentation changes, verification, and remaining gaps.

## Boundaries

- `/co` is explicit archival authorization for the selected artifact; do not require another generic approval for that archive.
- Do not implement outstanding Tasks merely to make an artifact appear complete. If an unfinished requirement remains, preserve it as unfinished and explain its disposition.
- Do not create/switch branches, worktrees, commit, push, or merge without separate authorization.
- `evidence-before-completion` owns completion claims; `epic-lifecycle` owns Epic document lifecycle and archive mechanics; `/co` owns the user-requested closeout orchestration.
- Do not archive an unrelated Brief or Epic, or infer a target when multiple candidates remain.

## Done when

- Durable Product/Dev documentation is synchronized with verified reality or unresolved discrepancies are explicitly reported.
- Work status and open risks remain honest.
- The selected artifact has been moved to the archive and active references updated.
- The final report identifies the archived path and any checks not run or not passing.
