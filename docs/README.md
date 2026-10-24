# AI_Portfolio documentation

## Authority
- [Product](./product/README.md): stable product concepts, behavior, experience, and guarantees.
- [Dev](./dev/README.md): durable technical ownership, architecture, contracts, conventions, and validation.
- [Workflow](./workflow/README.md): outstanding work and implementation steps.
- Current code: authoritative description of existing implementation.
- Historical work records do not redefine Product/Dev rules.

## Existing directories during migration
- [Technical](./technical/README.md): retained reference library for examples, historical designs, and operations; not a migration queue.
- [Quality basis](./basis/quality/SQ-01-local-sonarqube-workflow.md): retained SonarQube operating policy; coding conventions are now in [Dev conventions](./dev/conventions.md).
- [Templates](./templates/README.md): authoring aids for Brief/Epic and issue documents.
- [Epics](./epic/README.md): Epic authoring rules. Active work is the immediate `E##.*` directories; do not search archive by default.
- [Backlog](./backlog.md): unpromoted active problem list; [authoring rules](./backlog/README.md).
- [Issues](./issues/README.md): historical and active issue investigations.
- [Hotfixes](./hotfixes/README.md): targeted emergency change records.
- `docs/epic/archive/`: historical work, excluded from normal discovery unless expressly requested.

## Editing rules
- One canonical owner for each durable rule; link instead of copying.
- Read relevant authority and code, not every document in advance.
- Move documents only after auditing inbound links and ensuring their meaning survives.
- Keep migration notes and one-time inspections out of active Product/Dev SSOT.
