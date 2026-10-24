---
name: security-review
description: Use for review of diffs affecting web/API security, authentication, authorization, database, sessions/cache, integrations, secrets, cloud deployment, or dependencies. Produce scoped findings and a security verdict; not functional completion evidence.
---

# Security Review

Review the actual diff, its callers, consumers, configuration, and relevant current contracts. Do not treat old examples as adopted policy.

## Review sequence

1. Read the approved security acceptance requirements or establish the actual affected trust boundaries.
2. Inspect applicable risks:
   - HTTP input validation, injection, authN/authZ, IDOR, CSRF, XSS and session handling
   - API DTO/error/log disclosures, cookies, CORS and rate/resource limits
   - PostgreSQL/Flyway compatibility, transaction integrity, Redis/session/cache isolation
   - outbound request constraints, secrets, webhook authenticity and SSRF (when relevant)
   - CI/CD identity boundaries, environment separation, cloud permissions and exposed artifacts
   - dependency necessity, provenance, pinned manifests and severe known vulnerabilities
3. Trace security requirements to code and verification evidence.
4. Run only available applicable checks or report why they were not available. A SonarQube policy exists in `docs/basis/quality/`, but do not claim its server or scanner is running without evidence.
5. Classify findings with precise affected paths and actionable remediation.

## Report

| Severity | Finding / boundary | Evidence | Required action or accepted risk |
|---|---|---|---|

Verdict: **block**, **proceed after fixes**, or **proceed**, explicitly scoped to reviewed changes. Missing scans or unverified endpoints remain disclosed.

Use `receive-code-review-rigor` to process contested findings and `evidence-before-completion` for completion claims. A security verdict never substitutes for tests or behavior verification.
