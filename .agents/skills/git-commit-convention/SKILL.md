---
name: git-commit-convention
description: Use when creating a git commit — enforces Conventional Commits format, commit body structure, logical commit unit, and agent attribution trailers.
---

# Git Commit Convention

> AI_Portfolio migration note: Follow `docs/dev/development.md` and the actual repository build/test scripts for verification timing and commands. ClipPro-only examples (Tauri, Rust, Cargo, pnpm, IPC, SQLite, local media) are not applicable unless directly evidenced in AI_Portfolio. Backend/API, auth, PostgreSQL, cloud and browser boundaries take precedence when relevant. Any references to uncreated workflow docs are transitional and do not authorize inventing content.

Enforce consistent, machine-parseable, human-readable commit messages. Distilled from GC-01 (rules 03–05, 07).

## Instructions

### 1. Branch safety

- Never create or switch Git branches unless the user explicitly requests that branch action in the current request.
- A request to commit, implement, refactor, fix, or plan does not imply permission to create or switch branches.
- Stay on the current branch even when it is `main`, `master`, or another default branch.
- If a separate branch is genuinely required, stop and ask instead of creating one.

### 2. Commit unit check

Before composing the message, verify the staged changes represent **one logical change**.

- Litmus test: "If I revert this commit, exactly one coherent change is undone."
- If unrelated changes are staged, split them into separate commits.
- Refactoring + feature change → commit refactor first, then feature on top.
- Exception: when splitting would fragment context (e.g. large refactor), bundle with a clear body explaining scope.

### 3. Header format

```
{type}({scope}): {subject}
```

- **50 characters max** for the full header.
- **type** — one of: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`
- **scope** — domain term or module name.
  - Layer prefixes allowed: `ui/`, `api/`, `domain/`
  - Epic context: use `E##/P##` as scope (e.g. `feat(E05/P01): ...`)
  - Shorten if header exceeds 50 chars, but never omit scope entirely.
- **subject** — start with bare infinitive verb (`add`, `fix`, `update`, `remove`, `extract`). No period. Describe **what changes**, not what you did.

### 4. Body (optional — required when reason is not self-evident)

```
{empty line after header}
{why this change is needed, in natural language}
```

- Focus on **why**, not what — the diff shows what changed.
- Do **not** duplicate spec content or design rationale that lives in docs.
- Write so that a reader understands the motivation without opening any other file.
- Skip body for trivial changes (typo fix, formatting).

### 5. Trailers

```
{empty line after body}
Refs: E##/P##
Refs: #{issue-number}
BREAKING CHANGE: {description}
```

| Trailer | When |
|---------|------|
| `Refs: E##/P##` | When the commit belongs to an epic/phase. |
| `Refs: #{issue}` | When linked to a tracked issue. |
| `BREAKING CHANGE` | When backward compatibility breaks. |

### 6. Full example

```
feat(E05/P01): implement cart summary component

배송비 계산의 테스트 용이성을 위해 순수 함수로 분리.
동시 요청 시 배송비 중복 계산 방지를 위해 캐싱 적용.

Refs: E05/P01
```

Independent (non-epic) example:

```
fix(auth): prevent token refresh race condition

동시 요청 시 refresh token이 두 번 갱신되는 문제.
mutex 대신 첫 번째 응답을 공유하는 방식으로 해결.

Refs: #203
```

Trivial change — header only:

```
style(ui): fix button padding inconsistency
```

### 7. Encoding (Windows / non-ASCII bodies)

The console here runs codepage 949, so a Korean body passed inline via `git commit -m` can be encoded as CP949 and then read back as UTF-8. Invalid sequences become U+FFFD and **the original text is unrecoverable from the commit object** (this destroyed the body of `c1f63467`).

Whenever the message contains non-ASCII characters:

1. Write the full message to a UTF-8 file with a file-writing tool — not `echo`, not a heredoc.
2. Commit with `git commit -F <file>`.
3. Verify before moving on: `git log -1 --format=%B` should show intact text, and the message must contain no `U+FFFD`.

Repo-local `i18n.commitEncoding` / `i18n.logOutputEncoding` are set to `utf-8`, but that only labels and displays — it does not repair bytes that were already mangled on the way in.

## Red flags

- Creating or switching branches without an explicit user request in the current turn.
- Passing a non-ASCII commit body inline with `-m` on Windows.
- Mixing unrelated changes in one commit.
- Subject describes activity ("worked on", "changed") instead of outcome.
- Body restates the diff instead of explaining why.
- Header exceeds 50 characters.

## Done when

- No branch was created or switched unless the user explicitly requested it.
- Staged changes form one logical unit.
- Header follows `{type}({scope}): {subject}` within 50 chars.
- Body (if present) explains why in natural language — self-contained, no rule IDs.
- Required trailers are present.
- Non-ASCII messages were passed via `git commit -F` and verified free of U+FFFD.

<!-- Aligned with basis as of 2026-03 -->
