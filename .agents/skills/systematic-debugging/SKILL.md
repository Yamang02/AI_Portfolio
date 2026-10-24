---
name: systematic-debugging
description: Use when hitting any bug, test failure, unexpected behavior, flaky test, or build error. Establish a reproducible root cause before fixing; use the smallest appropriate repro as proof; regression tests may be written during implementation.
---

# Systematic Debugging

Do not fix before establishing a supported root-cause hypothesis.

## 1. Investigate

1. Read the complete error, stack, file, and environment.
2. Reproduce with the smallest reliable command or interaction.
3. Inspect relevant recent diffs, dependencies, configuration, and caller/data flow.
4. At multi-component boundaries, observe inputs and outputs to locate the first wrong state.
5. Trace the wrong value or transition back to its source.

## 2. Compare

1. Find similar working code in the repository.
2. List concrete differences and hidden assumptions.
3. Read the relevant contract or reference fully when the failure is a pattern mismatch.

## 3. Test one hypothesis

1. State: “Root cause is X because Y.”
2. Change or observe one variable that can falsify it.
3. If falsified, discard the hypothesis rather than stacking fixes.
4. If evidence is insufficient, report what is unknown.

## 4. Fix and verify

1. Establish a focused regression proof using a failing test, command, integration request, or reproducible browser scenario; add regression tests during implementation when appropriate.
2. Make one logical fix without drive-by refactoring.
3. Confirm the original repro passes and use `test-selection-and-verification` for the affected broader lane.
4. After three failed fix hypotheses, stop and reassess the architecture or premise with the user.

## Forbidden

- Symptom patch before reproduction and root-cause evidence
- Several unrelated changes before rerunning the repro
- Forcing `layered-tdd-workflow` when its description excludes the task
- Claiming a fix from a broader green suite that never reproduced the issue

## Done when

- The root cause and fix are supported by the appropriate regression proof, or
- Investigation stops with the exact unknown or architectural blocker.
