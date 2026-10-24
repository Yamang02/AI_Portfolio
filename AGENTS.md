# AI_Portfolio Agent Rules

## Scope and safety
- Read and write UTF-8.
- Inspect current code, affected consumers, and authoritative documents before changing behavior.
- Never create/switch branches or worktrees without explicit user authorization. Commit/push/merge only when requested.
- Load a skill from `.agents/skills/<name>/SKILL.md` only when its description matches the task; do not preload all skills.
- Never claim completion without inspecting the diff and actual verification output.
- Preserve unrelated changes and existing deployment credentials.

## Skill authority
- `.agents/skills/` is the canonical skill location. Do not use retired `.cursor/skills/` routing.
- Review: `request-code-review`, `receive-code-review-rigor`.
- Design/plan: `creative-design-brainstorm`, `implementation-plan-authoring`, `epic-lifecycle`.
- Execution: `plan-execution-checkpoints`, `evidence-before-completion`.
- Language: `react-stack`, `typescript-stack` where applicable.
- Debugging/refactoring: `systematic-debugging`, `refactoring-workflow`.
- SQL schema: `database-schema-design`.
- Apply project-specific paths, stages, commands, and runtime constraints from `docs/dev/development.md` over stale ClipTagger examples in imported skills. Unknown policy is unresolved, not implied.

## Documentation authority
- `docs/README.md` routes active product, development, and workflow documents.
- `docs/product/`: product meaning/behavior/experience.
- `docs/dev/`: durable technical ownership and implementation contracts.
- `docs/workflow/` and `docs/epic/`: active planning/execution context.
- `docs/dev/conventions.md`: cross-stack conventions; `docs/dev/frontend/` and `docs/dev/backend/` own stack-specific conventions. Skills govern when/how to work, not the coding rules themselves.
- Code is authoritative for current implementation; historic epics are not present-day technical authority.
- During transition, legacy `docs/technical/`, `docs/basis/quality/`, `docs/backlog/`, and `docs/issues/` remain available until audited and migrated.

## Verified repository commands
- Frontend: `npm run build:frontend`, `npm run test:frontend`.
- Profile: `npm run build:profile`.
- Backend: the tracked Maven/Docker policy in the existing repo applies; see backend configuration before executing. Do not assume pnpm/Cargo commands.
- A passing build alone does not establish UI behavior or test coverage.
