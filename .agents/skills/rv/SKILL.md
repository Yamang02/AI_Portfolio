---
name: rv
description: Use only when the user explicitly invokes RV or rv to perform a read-only executability review of epic documents for missing impact, architecture conflicts, false premises, verification gaps, and critical blockers. Do not edit documents or implement fixes unless separately requested.
---

# RV — Epic Executability Review

Review an epic as an adversarial pre-execution gate. The epic text is a proposal; repository artifacts and current SSOT are evidence.

## Establish target and evidence

1. Use the supplied epic path or identifier. Infer only when exactly one active epic is an unambiguous target; otherwise ask.
2. Read the epic `Readme.md` and all Phase documents in full.
3. Inspect relevant current code, product SSOT, dev architecture, data/API boundaries, persistence, integrations, and tests. Do not treat stale As-Is documentation or prior agent reports as proof.
4. For scope touching `frontend/src/**` or cross-stack contracts, trace affected frontend responsibilities, public interfaces, consumers, and integration points from current code and Product/Dev SSOT through the Epic goals and Phases; do not require retired capability ledgers.
5. Load specialized lenses only when triggered, such as `database-schema-design`, `security-threat-assessment`, language stack skills, or `test-selection-and-verification`.

## Review lenses

- Goal-to-Phase traceability and independently verifiable Phase outcomes
- Missing consumers, affected surfaces, cross-layer contracts, and operational impact
- Missing or falsely scoped impact: unaccounted consumers, changed public contracts, affected responsibilities, and Phase outcomes without traceable acceptance
- Architecture dependency violations, incompatible ownership, and duplicated sources of truth
- **Ownership & Boundaries conformance:** For every Phase creating, relocating, or composing material responsibility, verify its stated responsibility/guarantee, owner and ownership dimension, upstream Product/Dev authority or public contract, and consumer/adapter boundary against current SSOT, library/native API, and code. Use actual frontend code and `docs/dev/frontend/conventions.md` for frontend decisions; `ownership.md` is non-normative. Distinguish architectural ownership from agent/file edit ownership; do not infer an owner from package placement or the first consumer. Check whether planned Tasks and acceptance explicitly preserve the assigned owner without duplicating existing mechanics, policy, state, or execution. Treat a missing, contradictory, or unsupported ownership claim as an execution gap; label genuinely unresolved ownership rather than inventing certainty.
- False premises about current behavior or available infrastructure
- Sequencing, migration, rollback, recovery, concurrency, security, and irreversible operations
- Acceptance criteria supported by relevant test, build, API/integration and browser verification; missing required evidence remains unverified.
- Dependencies or unknowns that block execution before implementation starts

## Output contract

Return:

1. **Verdict:** `blocked`, `revision required`, or `executable`
2. **Critical blockers**
3. **Missing impact**
4. **Architecture and ownership conflicts**
5. **Verification gaps**
6. **Recommended Phase changes**

For every finding, state severity, the conflicting claim, concrete repository evidence with paths, and the smallest corrective direction. Do not return `executable` while a critical premise or required boundary remains unverified.

## Boundaries

- Read-only unless the user separately asks for edits.
- Do not change checkboxes, backlog status, Briefs, or code.
- Do not soften missing evidence into an assumption.
- Do not expand into general code review beyond the epic's claimed impact.

## Done when

- Every epic goal and Phase has been checked against current repository evidence.
- Each materially changed responsibility has a traceable owner, authority/public contract, and consumer boundary; Phase Tasks verify ownership conformance or explicitly expose unresolved decisions. Do not issue `executable` if an ownership uncertainty blocks implementation.
- Frontend and cross-stack impact is traceable from Epic goals and Phase acceptance to current code and Product/Dev authority, without requiring a capability ledger.
- Blocking findings are distinguishable from improvements.
- The verdict is justified by cited artifacts and explicit unknowns.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; verify edited links and only run checks actually available in this repository.
