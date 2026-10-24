---
name: security-threat-assessment
description: Use during design when a change affects trust boundaries, authentication, authorization, API input, persistence, external integrations, cloud deployment, secrets, or sensitive data. Define verifiable security requirements, not implementation reviews.
---

# Security Threat Assessment

Assess changed risks, not a generic threat catalogue. Read relevant Product/Dev contracts and current source/configuration.

## Boundaries and assets

1. Identify sensitive assets: administrative sessions, credentials, personal/content data, database records, integrations, deployment permissions, and logs.
2. Trace relevant entry points and trust boundaries:
   - browser (public/admin/profile) → HTTPS/API and session/auth boundary
   - API/controller → application/domain authorization and tenant/record ownership
   - application → PostgreSQL/Flyway, Redis/session/cache
   - backend → external AI/data APIs; inbound webhooks/callbacks if applicable
   - CI/GitHub Actions → AWS/GCP deployments, service identities and secrets
3. Identify who can call each boundary, what data they control, and impacts of abuse or partial failure.
4. Evaluate only applicable threats: broken access control/IDOR, CSRF, XSS, injection, insecure CORS/cookies, session fixation/replay, SSRF, secret leakage, excessive privileges, resource exhaustion, unsafe migration, data exposure, and supply-chain risk.
5. Translate meaningful controls into observable Design acceptance requirements. Mark unresolved ownership and risks explicitly.

## Output

| Boundary / asset | Threat and precondition | Required control | Acceptance verification |
|---|---|---|---|

Do not assume specific authentication protocols, cookie flags, public endpoints, hosting services, or database isolation until verified from source or approved decisions.

## Handoff

`creative-design-brainstorm` owns architecture choices; `implementation-plan-authoring` turns controls into scoped Tasks; `secure-coding-checklist` applies them and `security-review` examines the resulting diff. Do not claim a security review or compliance pass from a design table.
