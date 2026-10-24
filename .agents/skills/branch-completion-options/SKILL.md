---
name: branch-completion-options
description: Use only when the user asks to merge, open a PR, keep, discard, or clean up the current branch/worktree after implementation. Owns integration verification when a merge/PR is requested. Do not trigger automatically when code or an epic is complete.
---

# Branch Completion Options

Own user-requested branch/worktree disposition. It does not decide whether implementation requirements are complete.

## Before mutation

1. Apply `evidence-before-completion` to the implementation claim and use `test-selection-and-verification` for the agreed verification scope.
2. Inspect the current branch, worktree, dirty files, upstream, and likely base.
3. If verification fails, report it before offering merge or PR.
4. Preserve unrelated user changes.

## Integration verification

Confirm the target branch and compare against its actual merge base, not an assumed `master`. Audit feature-to-test coverage and use `test-selection-and-verification` for applicable frontend, profile and backend checks. Add missing justified regression tests at implementation or integration time; do not assume a root `verify` command. Report failures and unverified boundaries before the requested PR/merge. All mutations require explicit authorization.

## Options

Offer only options valid for the current repository state:

- merge locally into the confirmed base
- push and open a PR
- keep the branch/worktree unchanged
- discard, only with explicit destructive confirmation

Creating or switching a branch still requires an explicit user request. Pushing, opening a PR, merging, deleting a branch, and removing a worktree are separate external mutations; execute only the selected action.

## Safety

- Never discard without explicit confirmation naming the target.
- Never remove a worktree that contains uncommitted or unrelated work.
- Keep PR branches/worktrees unless the user requests cleanup.
- Rerun the agreed verification after a local merge before claiming the merged state passes.

## Done when

- For a merge/PR, applicable integration verification is reported before mutation.
- The exact requested disposition is executed and the resulting branch/worktree state is reported, or
- A failing verification or ambiguous/destructive target is reported without mutation.
