---
name: creative-design-brainstorm
description: Use when a feature, behavior change, or architecture choice still has meaningful uncertainty and needs an agreed approach before planning. Do not use for exact mechanical edits, already-approved designs, plan execution, or verification.
---

# Creative Design Brainstorm

Own the transition from **unsettled problem** to **approved design decision**. Do not own task decomposition, implementation, or completion claims.

## Process

1. Read only the context needed to identify the current behavior, constraint, and decision.
2. Clarify the goal, non-goals, constraints, and observable acceptance intent. Ask one blocking question at a time.
3. Present two or three realistic approaches when alternatives materially differ. State tradeoffs and a recommendation.
4. Record the chosen approach, rejected alternatives that matter, risks, and acceptance intent.
5. Obtain explicit user approval before treating the design as settled.

## Artifact boundary

- If an active epic Phase owns the work, put the Design in that Phase.
- Otherwise, for multi-step work, use one `docs/workflow/briefs/YYYY-MM-DD-<topic>.md`.
- For a small decision that does not need durable planning, the approved conversation is enough.
- Never create a separate design file beside a Phase or Brief for the same slice.
- Do not add Tasks. `implementation-plan-authoring` owns executable decomposition after approval.

## Hard boundaries

- Do not force a design ceremony for a precise, reversible edit whose behavior and acceptance criteria are already clear.
- Do not write production code while a material design choice is unresolved.
- Do not mark implementation or verification items complete.

## Done when

- The problem, constraints, chosen approach, non-goals, and acceptance intent are clear.
- The user approved the approach.
- The single target artifact is known when durable planning is needed.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; verify changed Markdown links and only run documented checks.
