# Frontend development

Frontend technical authority for `frontend/` (main and admin) and `profile/` (separate React site).

## Reading route
1. [Common conventions](../conventions.md)
2. [Frontend conventions](./conventions.md)
3. [Ownership](./ownership.md) — migration note; not yet normative
4. Existing [frontend architecture](../../technical/architecture/frontend-architecture.md), [frontend coding principles](../../technical/guides/frontend/coding-principles.md), and [design system](../../technical/design-system/README.md) only when their claims match current code.
5. Actual source, package scripts, public APIs, and tests.

## Responsibilities
- React composition, component and hook boundaries, interaction and state ownership
- Main/Admin separation and `profile/` application differences
- API client/query, server and UI state, accessibility and error behavior
- Presentation/design-system conventions with actual design-token sources

Legacy technical documents are migration references, not additional competing rule owners. The current code resolves what is implemented. Do not impose the main site's FSD directory structure on `profile/`.
