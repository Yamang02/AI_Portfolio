---
name: react-stack
description: Use when building or reviewing AI_Portfolio React UI components, hooks, FSD placement, state ownership, accessibility, or Testing Library test shape. Extends typescript-stack; does not select verification lanes or authorize completion.
---

# React Stack

Apply `typescript-stack` as the foundation and own React-specific choices.

## Naming and placement

- Component and component file: `PascalCase` / `PascalCase.tsx`, matching AI_Portfolio frontend conventions.
- Hooks: `usePurpose`; non-component hook modules follow the existing local filename convention.
- Props: `{Name}Props`; event props `onSelect`; local handlers `handleSelect`.
- Place code by FSD responsibility. Do not move code to `shared` merely because two callers exist; require a stable shared meaning.

## Components and hooks

- Keep presentational components props-in/UI-out; move orchestration to hooks or the owning feature/page.
- Use Effects to synchronize with systems outside React, such as browser APIs, subscriptions, or imperative widgets. When logic involves only React props/state, express it as render-time derivation or in the state transition that owns the change, not as an Effect.
- Call hooks only at the top level and keep effect dependencies complete.
- Split effects by responsibility instead of suppressing dependency rules.
- Define components at module scope, not inside render.
- Do not mutate props.

## State ownership

- Server/catalog data: TanStack Query or the established data owner; avoid duplicate global copies.
- Local interaction state: component/hook unless multiple distant owners require a store.
- Shareable navigation/filter state: URL or the existing navigation contract.
- Invalidate/refetch after mutations; optimistic updates require rollback.

## Accessibility

- Prefer semantic elements and native buttons/links.
- Give images correct alternative text; decorative images use empty alt.
- Associate labels with controls.
- Preserve keyboard operation and focus movement for interactive elements.
- When tests are written, target user-observable roles, names, states, and interactions.

## Test shape

Applies when tests are written at merge hardening or on explicit user request.

- Presentational behavior: Testing Library queries by role/name.
- Hooks: `renderHook` for observable return/state transitions.
- Multi-boundary flows: integration tests with established backend mocks.
- Assert logical DOM structure, accessible names/states, callbacks, keyboard/focus transitions, and state outcomes.
- Do not add tests for CSS appearance, computed style, actual layout geometry, screenshots, pixel diffs, stacking, cascade, or hover/focus paint results.

Use `test-selection-and-verification` to choose target/fast/full commands and `evidence-before-completion` for claims.

## Done when

- React ownership, placement, accessibility, and test shape fit the touched behavior.
- Suite selection and completion remain delegated to their owning skills.
