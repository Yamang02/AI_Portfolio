# Workflow documentation

Own active change scope and execution order, not durable Product/Dev rules.

## Transitional structure
- `docs/epic/`: current epic lifecycle, including Phase documents.
- `docs/epic/archive/`: historical epics.
- `docs/backlog/`: existing backlog.
- `docs/issues/`: issue investigations.
- `docs/workflow/briefs/`: narrow standalone changes when needed.
- `docs/workflow/backlog.md`: future canonical single backlog, pending migration of existing records.

## Boundaries
- Brief: single bounded change with local acceptance/verification.
- Epic: staged changes across domains/layers with independently verifiable Phases.
- Product/Dev: lasting semantics and technical decisions.
- Code: implemented state.

Do not duplicate an Epic Phase as a Brief. Do not mark tasks complete without implementation and verification evidence. Archive only on explicit authorization and preserve unresolved conditions.
