---
name: security-threat-assessment
description: Use during design when a AI_Portfolio change introduces or alters a trust boundary such as Tauri IPC input, filesystem move/delete/import, SQLite persistence, external processes or network services, secrets, or sensitive metadata. Produces security acceptance requirements; does not review implementation.
---

# Security Threat Assessment

> AI_Portfolio migration note: Follow `docs/dev/development.md` and the actual repository build/test scripts for verification timing and commands. ClipPro-only examples (Tauri, Rust, Cargo, pnpm, IPC, SQLite, local media) are not applicable unless directly evidenced in AI_Portfolio. Backend/API, auth, PostgreSQL, cloud and browser boundaries take precedence when relevant. Any references to uncreated workflow docs are transitional and do not authorize inventing content.

Own design-time security requirements before implementation Tasks are written.

## Assess

1. List assets that can be lost, exposed, corrupted, or executed: media files, catalog data, paths, credentials, user metadata.
2. Draw only the changed trust boundaries:
   - React/UI → Tauri command
   - command/application → filesystem or SQLite
   - application → ffmpeg or another external process
   - application → remote service
3. For each boundary, identify untrusted inputs, attacker or accident capability, failure impact, and recovery path.
4. Check applicable threats:
   - path traversal, symlink/junction escape, wrong-root deletion or overwrite
   - command/argument injection
   - malformed media or oversized input causing resource exhaustion
   - partial file/DB state after interruption
   - sensitive values in logs, errors, config, or generated artifacts
   - unauthorized remote access or excessive external data disclosure
   - vulnerable or unnecessary dependency
5. Convert mitigations into observable acceptance requirements in the approved Design artifact.

## Output

Use a compact table:

| Boundary/asset | Threat | Required control | Acceptance evidence |
|----------------|--------|------------------|---------------------|

Mark non-applicable categories instead of inventing web authentication, CORS, or rate limiting for local-only flows.

## Boundaries

- `creative-design-brainstorm` owns the product/architecture choice.
- `implementation-plan-authoring` turns accepted controls into Tasks.
- `secure-coding-checklist` applies controls during code changes.
- `security-review` verifies the resulting diff.

## Done when

- Every changed trust boundary and material asset has a control or an explicit accepted risk.
- Controls are stated as implementation acceptance conditions, not generic advice.
