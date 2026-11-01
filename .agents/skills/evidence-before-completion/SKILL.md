---
name: evidence-before-completion
description: Use immediately before marking a Task, Phase, Brief, epic, bug, build, or test claim complete. Match every acceptance condition to freshly inspected implementation artifacts and current-session verification evidence; otherwise report it as incomplete or unverified.
---

# Evidence Before Completion

Own the **authorization of completion claims**. Other skills may produce artifacts or choose checks; they may not substitute for this gate.

## Claim ledger

Before a success claim or `[x]`, build or inspect this mapping:

| Acceptance condition | Implementation inspected | Verification evidence | State |
|----------------------|--------------------------|-----------------------|-------|
| requirement | actual diff/file/symbol or N/A reason | command/runtime/manual result | met / unmet / unverified |

Apply the gate:

1. Read the authoritative acceptance conditions from the user request and the active Phase/Brief.
2. For claims touching `frontend/src/**` or cross-stack contracts, inspect actual changed responsibilities, owners, public contracts, consumers, and relevant Product/Dev SSOT. Confirm that the acceptance scope covers discovered impact; do not require retired capability ledgers or IDs.
3. Inspect the actual diff and relevant files/symbols for implemented requirements. Another agent’s summary or the mere existence of changed code is not evidence.
4. Use `test-selection-and-verification` to select commands matching the claim scope.
5. Run required commands in the current session and read their actual output and exit code.
6. Use browser/runtime checks when material and available; record unverified gaps otherwise.
7. Treat structural checks as proof only of structure. Tests prove only the behavior they exercise and do not replace implementation inspection.
8. Mark a row `met` only when both required columns are satisfied. Use `N/A` only with a concrete reason, such as a documentation-only condition with no production implementation.
9. Mark complete only if every required row is `met`. Preserve `[ ]` for `unmet` or `unverified`.

## Claim scope

| Claim | Minimum evidence |
|-------|------------------|
| Task, Brief, or Epic Phase complete | Inspected implementation and acceptance-specific executed tests, builds, integrations and browser checks, with missing requirements unverified |
| Merged into target branch | Confirmed target and merge commit, reviewed diff and relevant verification |
| Relevant tests pass | Named target or fast suite with passing output |
| Stack full passes | Matching stack full suite with passing output |
| Full tests pass | Root full suite with passing output |
| Build succeeds | Matching build command, exit 0 |
| Bug fixed | Inspected correction and passing reproduction or regression proof |
| Requirements complete | Inspected implementation and verification for every acceptance row |
| Docs synchronized | Structural check plus semantic comparison to current code/contract |
| Frontend contract and ownership synchronized | Changed responsibility, owner/public contract, relevant consumers, current Product/Dev authority, and inspected implementation agree; unresolved gaps remain explicit |

If output gives only an exit code and no test count, report exactly that; do not invent “0 failures.”

## Forbidden

- “Should work”, “probably”, or “done” without current evidence
- Converting a partial suite into a full-suite claim
- Checking a Task because tests pass without inspecting its implementation
- Checking a parent Phase because child Tasks merely have code changes
- Trusting a subagent, prior session, stale log, or Brief text as proof
- Hiding an unavailable environment; name it as unverified
- Treating unavailable required acceptance evidence as optional merely because a build passes

## Done when

- The claim ledger supports the exact wording and checkboxes used, or
- The result explicitly names what remains unmet or unverified.
