---
name: gcws
description: Use only when the user explicitly invokes GCWS or gcws to analyze the entire dirty worktree, split all safe coherent changes into logical commits, and report leftovers. Whole-worktree scope does not authorize discarding files, committing secrets or incomplete artifacts, pushing, branching, or rewriting history.
---

# GCWS — Whole-Worktree Logical Commits

Treat the entire dirty worktree as the analysis scope, while committing only safe and coherent groups.

## Inventory and partition

1. Inspect all tracked, staged, and untracked changes.
2. Classify every change into a logical revert group or an explicit leftover.
3. Detect secrets, generated artifacts, accidental binaries, incomplete documents, conflicting changes, and broken code before staging.
4. Order groups so foundational refactors or contracts precede dependent behavior.

Explicit `gcws` invocation authorizes analysis and commit consideration for the full worktree. It does not authorize destructive cleanup or make every dirty file commit-ready.

## Commit loop

For each safe, independently revertible group:

1. Inspect its complete diff and intended outcome.
2. Use `test-selection-and-verification` to run checks proportional to the group.
3. Stage explicit paths or hunks and inspect the staged diff for leakage from other groups.
4. Apply `git-commit-convention` and create one logical commit.
5. Verify the commit, message integrity, and remaining worktree before continuing.

Use `evidence-before-completion` for verification and completion claims. Leave failing, ambiguous, unsafe, or incoherent groups uncommitted.

## Boundaries

- Never commit secrets, local credentials, unexplained generated files, or known-broken work.
- Never discard, overwrite, stash, or clean leftovers.
- Never create or switch branches, push, amend, rebase, or rewrite history.
- Never describe an unverified group as complete.

## Done when

- Every safe coherent group has its own independently revertible commit.
- Each verification claim has fresh evidence.
- Every remaining change is preserved and reported with the reason it was not committed.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; verify edited links and only run checks actually available in this repository.
