---
name: dev-documentation-governance
description: Use when writing, moving, or materially changing AI_Portfolio durable technical documents or reconciling them after an Epic or Brief.
---

# Dev Documentation Governance

Read `docs/README.md`, `docs/dev/README.md`, `docs/dev/conventions.md` when coding conventions are relevant, and the relevant existing authority before editing.

- Product concepts, behavior and experience -> `docs/product/`.
- Technical owners, invariant contracts, architecture and conventions -> `docs/dev/`.
- Active planning, status and execution evidence -> `docs/workflow/` or transitional `docs/epic/`.
- Historical evidence -> existing archives.
- Real implementation state -> code; do not copy full inventories into SSOT.

## Transition
`docs/technical/` and `docs/basis/` remain legacy authorities until individually audited. Do not delete them en masse or silently replace them with empty docs. Move a file only after identifying its canonical owner, inspecting inbound links, updating active references and checking meaning against code.

## Verification
Check edited Markdown links, document router destinations, duplicated or conflicting normative statements, and relevant application checks when contracts change. Do not claim an `npm run check:dev-docs` script exists unless package.json actually declares it.

## Done when
The changed subject has one clear canonical owner, references resolve, claims are grounded in current code or approved decisions, and outdated duplicates are removed or explicitly marked transitional.
