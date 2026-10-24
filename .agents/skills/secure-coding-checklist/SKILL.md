---
name: secure-coding-checklist
description: Use during AI_Portfolio implementation when code handles Tauri IPC input, filesystem paths or destructive operations, SQLite writes, external commands, network services, secrets, sensitive logs, or new dependencies. Applies coding-time controls; does not perform final security review.
---

# Secure Coding Checklist

> AI_Portfolio migration note: Follow `docs/dev/development.md` and the actual repository build/test scripts for verification timing and commands. ClipPro-only examples (Tauri, Rust, Cargo, pnpm, IPC, SQLite, local media) are not applicable unless directly evidenced in AI_Portfolio. Backend/API, auth, PostgreSQL, cloud and browser boundaries take precedence when relevant. Any references to uncreated workflow docs are transitional and do not authorize inventing content.

Apply only sections touched by the change.

## Boundary input

- Validate type, length, range, enum membership, and required relationships at the system boundary.
- Treat TypeScript types as compile-time help, not runtime validation of IPC or external data.
- Return stable errors without internal paths, SQL details, secrets, or stack traces.

## Filesystem and media

- Resolve and validate paths against the intended root before move, delete, overwrite, or import.
- Account for symlinks/junctions, name collisions, partial copies, and cross-volume moves.
- Use recoverable or staged operations where the product contract requires recovery.
- Validate media size/type before expensive parsing; never trust extension alone for security decisions.

## Persistence

- Use parameterized SQL.
- Keep filesystem and SQLite ordering consistent with the documented transaction/recovery contract.
- Preserve foreign-key and migration compatibility; do not silently discard data.

## External process and network

- Pass process arguments as an argument array; do not construct shell command strings from input.
- Bound time, output, and resource consumption where malformed media can hang work.
- Minimize data sent to remote services and use TLS.
- Keep credentials outside tracked source; redact them from logs and errors.

## Dependencies

- Prefer existing capability.
- Inspect maintenance and known severe vulnerabilities before adding a dependency.
- Update and preserve the lockfile.
- Use established libraries for security-sensitive parsing or cryptography.

## Done when

- Every applicable design-time security requirement is implemented or explicitly risk-accepted.
- No introduced path, command, persistence, secret, or dependency hazard remains hidden.
- Final diff assessment is left to `security-review`.
