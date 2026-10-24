---
name: imp
description: Use only when the user explicitly invokes IMP or imp to implement a specified standalone Brief, Epic Phase, or bounded set of its Tasks. Execute the existing plan without creating a duplicate plan or silently expanding scope.
---

# IMP — Plan Implementation

Execute an approved Brief, Epic Phase, or explicitly selected Tasks. This skill is the user-facing entrypoint; `plan-execution-checkpoints` owns the execution procedure, verification checkpoints, and status updates.

## Workflow

1. Resolve the explicitly supplied Brief, Epic Phase, or Task IDs. Use an unambiguous active artifact from the current conversation when no path is supplied; do not invent a target.
2. Load and follow `plan-execution-checkpoints`. Read the owning artifact, relevant Product/Dev SSOT, and current implementation. Honor existing dependencies and implementation scope.
3. Before implementing changed responsibilities, verify the artifact's **Ownership & Boundaries** against current SSOT, actual owners, public contracts, and native/library APIs. For a missing or contradicted owner, repair a minor Plan drift with evidence or surface a blocking decision; never silently introduce a competing owner.
4. Implement only the selected scope. Load language, debugging, refactoring, or security skills only when their descriptions directly apply. Do not create a duplicate Brief, Epic, or architecture authority.
5. Inspect the actual diff for Task acceptance, dependencies, and Ownership Conformance. Use `test-selection-and-verification` for affected-stack `check` and `build`, and `evidence-before-completion` before claiming completion. Running-app observation stays in the user's `## 사용자 검증` lane under the current work-stage policy.
6. Update Task/Phase status only where the inspected evidence supports it. Summarize implemented scope, verification results, unfinished conditions, and any corrected ownership claim. Update the Product/Dev SSOT required by the implemented change alongside its code; leave final reconciliation, archive-oriented documentation cleanup, and archival to an explicit `/co` request. Do not commit, push, merge, create or switch branches, or open a worktree without separate authorization.

## Boundaries

- `/br` and `/ep` author plans; `/rv` performs a read-only pre-execution review; `/imp` executes an existing plan; `/co` performs explicit closeout and archival. Keep these responsibilities separate.
- This skill does not replace `plan-execution-checkpoints`, `evidence-before-completion`, or stack-specific skills.
- If a user requests implementation without a written Brief/Phase, do not fabricate one solely to satisfy this skill. Use the ordinary implementation workflow or ask for an explicit planning request only when the work genuinely needs a plan.
