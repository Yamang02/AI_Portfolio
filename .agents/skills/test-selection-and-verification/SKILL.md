---
name: test-selection-and-verification
description: Use when choosing or running verification for an AI_Portfolio change, classifying checks by changed boundary, or deciding what evidence supports a test, build, or behavior claim.
---

# Test Selection and Verification

Own the selection and execution of checks. `evidence-before-completion` alone authorizes completion claims.

## Select from actual changes
1. Identify changed stack: frontend, profile, backend, infrastructure, documentation.
2. Identify contract type: pure logic, UI/component, API/integration, persistence, migration, security, deployed/runtime behavior.
3. Reproduce the failure or define the acceptance requirement before choosing an appropriate check.
4. Run narrow checks first where available, then affected build and relevant broader suites.
5. Record command, environment, actual exit code/output, and unverified boundaries.

## Existing commands
- Main website/admin: `npm run build:frontend`, `npm run test:frontend`.
- Profile: `npm run build:profile` (no test script currently declared).
- Backend: `npm run test:backend`, `npm run build:backend`; inspect Maven/Docker execution requirements first.
- Root: `npm run test`, `npm run build`.
- No pnpm, Cargo, or ClipTagger's root `verify` should be assumed.

## Test kinds
- Unit: isolated logic, fake dependencies.
- Component: DOM semantics, observable state, accessibility, interactions.
- Integration: API/database/service boundaries and migrations.
- Browser/E2E: browser-visible flows, routing, layout, runtime/network interactions.
- Manual/deployment: actual deployed environment, credentials, infrastructure, external services.

Test writing is permitted during implementation when behavior or risk warrants it. TDD is not mandatory without an explicit request. Visual checks are not proved by jsdom or CSS class assertions. Browser behavior is not established by a green build.

## Claims
Distinguish `passed`, `failed`, `not run`, and `not available`. Do not claim that a check proves more than its assertions cover. See `docs/dev/development.md`.
