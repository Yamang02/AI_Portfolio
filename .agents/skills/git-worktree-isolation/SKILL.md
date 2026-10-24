---
name: git-worktree-isolation
description: Use only when the user explicitly asks for a separate git worktree/checkout — never as the default for plan or feature work. Pick a worktree directory, ensure it is gitignored if inside the project, add branch, install deps, verify clean tests.
---

# Git Worktree Isolation

> AI_Portfolio migration note: Follow `docs/dev/development.md` and the actual repository build/test scripts for verification timing and commands. ClipPro-only examples (Tauri, Rust, Cargo, pnpm, IPC, SQLite, local media) are not applicable unless directly evidenced in AI_Portfolio. Backend/API, auth, PostgreSQL, cloud and browser boundaries take precedence when relevant. Any references to uncreated workflow docs are transitional and do not authorize inventing content.

**Announce at start:** you are using this skill to create an isolated worktree.

## When to use (hard gate)

Use this skill **only if**:

1. The user **explicitly** requests a separate worktree / isolated checkout, or  
2. You asked because of a concrete conflict and the user **confirmed** worktree isolation.

**Do not** open a worktree by default for plan execution, feature work, or because the current branch is `main`/`master` or has dirty files. Prefer the **current checkout** unless the user says otherwise.

## 1. Choose directory (priority)

1. If `.worktrees/` exists → use it (wins over `worktrees/`).
2. Else if `worktrees/` exists → use it.
3. Else if project docs (e.g. `AGENTS.md`, `.cursor` README) specify a path → follow that.
4. Else **ask** the user: project-local `.worktrees/` vs global path outside repo.

## 2. Safety (project-local only)

For `.worktrees` or `worktrees` **inside** the repo:

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

If **not** ignored: add to `.gitignore`, commit, then continue.

## 3. Create worktree

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
# Example — adjust branch name
git worktree add "<chosen-dir>/<branch-slug>" -b "<branch-name>"
cd "<chosen-dir>/<branch-slug>"
```

Use the repo’s real branch naming (e.g. `feat/E##/P01-scope` per GC-01).

## 4. Setup

Use the actual repository's npm scripts and approved Maven/Docker workflow; inspect manifests before environment preparation. Do not assume other stack tools.

## 5. Baseline verify

Run the project’s test (or check) command. If it fails: **report** and ask whether to proceed.

## 6. Report

```
Worktree: <absolute-path>
Branch: <name>
Baseline: <command> → <outcome>
```

## Red flags

- Creating a worktree **without** explicit user request/confirmation.
- Creating project-local worktree dir **without** ignore check.
- Proceeding with **failing** baseline tests without user OK.
- Assuming directory without following priority / user choice.

## Done when

- Worktree exists, branch checked out, deps installed, baseline outcome recorded.

Aligned with basis as of 2026-03 — prior using-git-worktrees (distilled); pair with **`branch-completion-options`** to remove worktree when finished.
