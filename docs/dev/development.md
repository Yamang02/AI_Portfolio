# AI_Portfolio development and verification

> Status: maintained (migration baseline)

## Repository areas
- `frontend/`: main website and admin, React/TypeScript/Vite.
- `profile/`: separate profile site, React/TypeScript/Vite.
- `backend/`: Java 17, Spring Boot, Maven; PostgreSQL/Flyway among persistence dependencies.
- `infrastructure/`: deployment/infrastructure configuration.

## Local runtime boundaries

- `frontend/.env.local` is loaded by Vite and contains browser-safe `VITE_*` values such as `VITE_API_BASE_URL`.
- `backend/.env` is loaded by Docker Compose and contains local backend, PostgreSQL, Redis, and optional integration values.
- `backend/docker-compose.yml` owns the local PostgreSQL, Redis, backend, pgAdmin, and backend Sonar services.
- The frontend is intentionally not a Compose service; run it with `cd frontend && pnpm run dev`.
- Root `.env.local` and `.env.staging` are not consumed by this local split; keep frontend values in `frontend/.env.local` and Compose values in `backend/.env`.

Typical local startup:

```bash
cd backend
docker compose up -d postgres redis backend

# In another terminal:
cd frontend
pnpm run dev
```

## Tracked commands (root package.json)
- `npm run build:frontend`
- `npm run build:profile`
- `npm run test:frontend`
- `npm run test:backend`
- `npm run build:backend`

These are declared scripts, not evidence that they passed. Root backend scripts invoke `mvnd`; the existing `AGENTS.md` previously mandated Maven within Docker. Confirm runtime availability and Docker compose behavior before execution. Do not silently drop that restriction based solely on npm scripts.

## Verification policy
- Prefer targeted checks for changed files, then affected module build/test, then broader integration checks as appropriate.
- A task may claim only the checks actually executed. Never treat tests as equivalent to actual browser and deployed behavior.
- The policy inherited from ClipTagger to author all tests only at merge-hardening is **not adopted** for AI_Portfolio. Add regression tests during implementation where behavior risk warrants it; do not impose universal TDD.
- A change affecting frontend or profile presentation may require browser-level user-facing validation; record it separately from static/build evidence.
- Store secrets outside tracked files and confirm CI/deployment contracts before infrastructure changes. The Cloud Run and AWS workflows do not depend on the local Compose files; they use the root `Dockerfile.prod` and GitHub Variables/Secrets.

## Agent rules
See [AGENTS.md](../../AGENTS.md) and the task-specific `.agents/skills/` files. If an imported skill conflicts with this repository contract, this document governs repository-specific commands and verification policy while the skill is corrected.
