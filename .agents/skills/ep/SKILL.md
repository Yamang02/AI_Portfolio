---
name: ep
description: Use only when the user explicitly invokes EP or ep to discuss and author or materially revise an Epic and its Phase documents.
---

# EP — Epic Authoring

> AI_Portfolio migration note: Follow `docs/dev/development.md` and the actual repository build/test scripts for verification timing and commands. ClipPro-only examples (Tauri, Rust, Cargo, pnpm, IPC, SQLite, local media) are not applicable unless directly evidenced in AI_Portfolio. Backend/API, auth, PostgreSQL, cloud and browser boundaries take precedence when relevant. Any references to uncreated workflow docs are transitional and do not authorize inventing content.

Use Epic only when the work crosses multiple domains/layers, needs multiple independently verifiable slices, or requires staged migration and broad integration/regression verification.

## Workflow

1. Inspect `docs/backlog/README.md`, relevant Product/Dev SSOT, code, and active Epics.
2. If the work is a narrow single item, route to `br` instead.
3. Settle goals, constraints, non-goals, architecture boundaries, and acceptance intent.
4. Use `epic-lifecycle` to create or revise `docs/epic/...`.
5. Use `implementation-plan-authoring` to write executable Tasks inside the owning Phase, including its SSOT consistency check against `docs/product/**` and `docs/dev/**`. Add the dependency and parallel-execution summary described below near the top of the README and every Phase; do not create a duplicate standalone Brief.
6. Use `test-selection-and-verification` to name the checks each Phase closes with: affected-stack `check` and `build` only. Do not launch the app or use browser tools to observe behavior; until beta, running-app observation belongs to the user's `## 사용자 검증` lane. Do not plan test-writing Tasks or require test lanes per Phase; automated write or run tests during implementation when justified by the change; use the repository verification policy.
7. Leave implementation and completion status unchecked until separately verified.

Current implementation is read from code. Product/Dev SSOT provides durable meaning and rules. Do not depend on retired capability ledgers, As-Is inventories, or old document paths.

## Ownership in the Epic

Record cross-Phase responsibility and contract boundaries once in the Epic README when they govern the whole Epic. Every Phase that creates or relocates responsibilities must contain the concrete **Ownership & Boundaries** section defined by `implementation-plan-authoring`, with owner, ownership dimension, upstream authority/public contract, consumer/adapter and unresolved gaps. Include owner conformance in applicable Task acceptance and re-check during implementation via `plan-execution-checkpoints`. Distinguish architectural responsibility ownership from the agent/file edit ownership in the parallel-execution summary; do not duplicate durable Product/Dev rules in Workflow.

## Dependency and parallel-execution summary

Place an execution summary immediately after status, before detailed goals, contracts, or Tasks.

- In the Epic README, summarize Phase dependencies, parallel agent workstreams, shared-file ownership, and the final integration point.
- In every Phase, list each Task ID with its blocking Phase/Task dependencies and whether agent execution is parallel, conditional, or sequential. Name the work/file scope each agent can own and the handoff or contract that must be ready first.
- Distinguish read-only investigation that can start early from implementation that must wait for a dependency. If implementation has no independent slice, say it is sequential and explain the shared state or prerequisite; do not invent parallelism.
- Identify exclusive files and mutable resources, including public exports, SSOT, manifests/lockfiles, installs, and shared check/build output. Assign their edits and integration checks to one coordinating owner; parallel agents must not mutate them concurrently.
- Name where results converge and require the integrating agent to inspect the combined diff/artifacts and run the affected checks before updating status. A subagent completion message is not evidence.
- Keep the top summary, Task-level dependencies, and README consistent when scope changes. A compact dependency/ownership table is sufficient; do not require a fixed agent count or duplicate the full Task bodies.

## Boundaries

- Do not implement code while only authoring the Epic.
- Do not archive or mark completion without evidence.
- Do not create or switch branches unless explicitly requested.

---
## Documentation governance

Creating, moving, or materially updating `docs/dev/**` requires loading and following `dev-documentation-governance`; run `npm run check:dev-docs` before claiming the documentation slice complete.
