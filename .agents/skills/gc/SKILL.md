---
name: gc
description: Use only when the user explicitly invokes GC or gc to split and commit changes attributable to the current conversation or work session. Exclude pre-existing and unrelated work; if attribution is unreliable, leave changes uncommitted and ask for scope or recommend gcws. Never push, branch, or rewrite history.
---

# GC — Current-Session Logical Commits

Commit only changes that can be attributed to the current conversation or work session.

## Establish scope

1. Inspect `git status`, diffs, and the session's known starting state.
2. Build an inclusion set from files or hunks changed during this session and an exclusion set for pre-existing, user-authored, or unrelated work.
3. If the baseline is missing or attribution is ambiguous, do not guess. Leave the ambiguous changes untouched and request scope, or recommend `gcws` when the user intends to cover the whole worktree.

## Commit loop

For each independently revertible group:

1. Inspect the complete diff and classify incomplete, generated, secret-bearing, or unsafe artifacts as leftovers.
2. Use `test-selection-and-verification` to run checks proportional to that group. A failed requirement is not converted into success because a command exited zero.
3. Stage only explicit in-scope paths or hunks, then inspect the staged diff.
4. Apply `git-commit-convention` and create one logical commit.
5. Verify the resulting commit, message integrity, and remaining worktree before continuing.

Use `evidence-before-completion` for claims about verification or completion. Leave any failed or incoherent group uncommitted and report why.

## Boundaries

- Never include changes merely because they are dirty.
- Never discard, overwrite, stash, or clean excluded work.
- Never create or switch branches, push, amend, rebase, or rewrite history.
- Never conceal skipped checks or unresolved failures.

## Done when

- Every created commit is a coherent revert unit containing only session-attributable changes.
- Each verification claim has fresh evidence.
- Excluded, ambiguous, or incomplete changes remain intact and are listed explicitly.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; verify edited links and only run checks actually available in this repository.
