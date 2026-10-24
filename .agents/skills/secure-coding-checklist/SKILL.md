---
name: secure-coding-checklist
description: Use while implementing code that touches API inputs, authentication, authorization, persistence, external services, secrets, sensitive data, deployment, or dependencies. Apply design-time security controls; does not replace final security review.
---

# Secure Coding Checklist

Apply only to the changed threat boundaries. Ground controls in current source and applicable requirements.

## HTTP/API and browser

- Validate untrusted input types, bounds, identifiers, query parameters, and payload shape at runtime.
- Enforce authentication and per-resource authorization server-side; the UI hiding an action is not authorization.
- Check CSRF, CORS, session cookies, XSS/HTML rendering, upload bounds and error disclosure where applicable.
- Do not expose internal IDs, stack traces, sensitive payloads, or secrets through public DTOs, logs, or client bundles.
- Confirm rate/resource limits when an endpoint triggers expensive external or AI calls.

## Persistence, cache, integrations

- Use parameterized queries and domain validation; retain transactional and relational invariants.
- Plan Flyway changes for existing data, compatibility, and rollback/recovery. Avoid accidental destructive updates.
- Preserve explicit Port/Adapter boundaries for Redis and external integrations as established in the repository. Do not reintroduce framework cache annotations based on old examples.
- Use timeouts, response validation and bounded retries for outbound requests; review SSRF and webhook authenticity where applicable.

## Deployment and secrets

- Keep secrets in approved runtime/CI secret stores, never tracked files or application logs.
- Scope AWS/GCP identity privileges and confirm protected environment/branch boundaries for release changes.
- Restrict sensitive CI outputs, artifacts and failure messages.
- Inspect dependency provenance and vulnerabilities before adding packages; update matching manifests and lockfiles.

## Verification and handoff

- Use the targeted tests, static analysis and runtime checks warranted by the change.
- Document controls that cannot be exercised and any explicit accepted risks.
- `security-review` owns the diff-level security verdict; `evidence-before-completion` owns completion claims.
