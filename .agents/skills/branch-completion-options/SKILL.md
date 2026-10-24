---
name: branch-completion-options
description: Use only when the user asks to merge, open a PR, keep, discard, or clean up the current branch/worktree after implementation. Owns merge hardening (writing tests for implemented features) when a merge into master is confirmed. Do not trigger automatically when code or an epic is complete.
---

# Branch Completion Options

> AI_Portfolio migration note: Follow `docs/dev/development.md` and the actual repository build/test scripts for verification timing and commands. ClipPro-only examples (Tauri, Rust, Cargo, pnpm, IPC, SQLite, local media) are not applicable unless directly evidenced in AI_Portfolio. Backend/API, auth, PostgreSQL, cloud and browser boundaries take precedence when relevant. Any references to uncreated workflow docs are transitional and do not authorize inventing content.

Own user-requested branch/worktree disposition. It does not decide whether implementation requirements are complete.

## Before mutation

1. Apply `evidence-before-completion` to the implementation claim and use `test-selection-and-verification` for the agreed verification scope.
2. Inspect the current branch, worktree, dirty files, upstream, and likely base.
3. If verification fails, report it before offering merge or PR.
4. Preserve unrelated user changes.

## Merge hardening

When the user confirms a merge (or PR) of the work branch into the target branch, run merge hardening before the merge mutation. `docs/dev/development.md` § Test authoring timing is the SSOT.

1. Build a feature list from `git diff master...HEAD` and the branch's workflow artifacts (Epic Phases, Briefs). Name each implemented feature and its owning layer and stack.
2. For each feature, write tests with the kinds and placement from `test-selection-and-verification`. Put core contracts first: data integrity, transactions, workspace isolation, IPC/failure projection, then UI logical behavior.
3. Repair or replace pre-existing tests that the branch broke. Record intentional contract changes rather than silently loosening assertions.
4. Run root `verify`. Do not merge while it fails. Report the failure and the remaining features without tests.
5. Report the feature list with each feature's test file(s), or an explicit reason when a feature gets no test (for example, visual-only, which belongs to the user-verification lane).

Committing the hardening tests follows the user's commit instructions; do not commit unasked.

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

- For a merge into the target branch, merge hardening produced the feature-to-test report and root `verify` passed before the merge.
- The exact requested disposition is executed and the resulting branch/worktree state is reported, or
- A failing verification or ambiguous/destructive target is reported without mutation.
