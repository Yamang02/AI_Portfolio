---
name: security-review
description: Use after a meaningful AI_Portfolio implementation slice or before merge when the diff touches IPC input, filesystem operations, SQLite writes, external processes or services, secrets, sensitive logging, or dependencies. Produces a security verdict; does not replace functional verification or completion evidence.
---

# Security Review

> AI_Portfolio migration note: Follow `docs/dev/development.md` and the actual repository build/test scripts for verification timing and commands. ClipPro-only examples (Tauri, Rust, Cargo, pnpm, IPC, SQLite, local media) are not applicable unless directly evidenced in AI_Portfolio. Backend/API, auth, PostgreSQL, cloud and browser boundaries take precedence when relevant. Any references to uncreated workflow docs are transitional and do not authorize inventing content.

Own a security-focused verdict on the actual diff.

## Review

1. Read the authoritative Design security requirements when they exist.
2. Inspect the diff and callers, not only changed lines.
3. Review applicable boundaries:
   - runtime validation at Tauri/external input
   - path root, traversal, symlink/junction, collision, and destructive-operation safety
   - SQLite parameterization, transaction ordering, and recovery consistency
   - external command argument construction and resource bounds
   - remote data minimization, TLS, credentials, logs, and error disclosure
   - new dependency necessity, lockfile, maintenance, and severe vulnerabilities
4. Run available security/static scans relevant to the changed stack. Report unavailable tools rather than fabricating a pass.
5. Trace every threat-assessment requirement to code and evidence; flag silent omissions.

## Report

```markdown
## Security Review — [slice]

### Scope
[paths and boundaries]

### Findings
- Critical: exploitable loss, exposure, arbitrary access/execution, or recovery break
- Important: missing required defense or meaningful weakening
- Observation: non-blocking defense-in-depth

### Requirement trace
[requirement → implementation/evidence]

### Verdict
block | proceed after fixes | proceed
```

Use `receive-code-review-rigor` to process disputed findings. A security verdict is not proof that functional requirements or test suites pass; use `evidence-before-completion` for those claims.

## Done when

- Every security-relevant changed boundary was inspected.
- Findings cite concrete paths or symbols and have a disposition.
- The verdict scope and any unavailable scan are explicit.
