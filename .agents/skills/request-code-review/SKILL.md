---
name: request-code-review
description: Use when a meaningful implementation slice needs a structured diff review against stated requirements, especially before merge or after a high-risk Task. Do not use as a substitute for tests or completion evidence.
---

# Request Code Review

Own the production of a requirements-based review result.

## Review input

Provide:

- changed paths or diff range
- authoritative requirements or Task acceptance
- known constraints and explicit non-goals
- verification facts already available

Use a separate reviewer pass or bounded review worker when the host supports it. A review worker must receive the raw diff and requirements, not the implementer’s conclusion.

## Review order

1. Compare the diff to required outcomes: missing behavior and unrequested scope.
2. Inspect correctness, error paths, boundaries, tests, maintainability, and project conventions.
3. For Java/Spring Boot diffs apply `docs/dev/backend/conventions.md` and for React/TypeScript use the applicable frontend conventions.
4. Classify findings as Critical, Important, or Minor and cite files/symbols.
5. Fix or explicitly disposition findings; rerun the review when material changes follow.

Security-specific assessment belongs to `security-review`; it may run as an orthogonal pass.

## Boundaries

- Review approval is not test evidence.
- No “all good” claim without `evidence-before-completion`.
- Do not require a review after every tiny Task; use it for meaningful slices and risk boundaries.

## Done when

- Requirements and diff were compared directly.
- Actionable findings are fixed, accepted, or clearly deferred.
- The verdict scope is explicit and is not presented as completion proof.
