# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Condor Seeker is a PWA for golf scoring, statistics, and course management. Built with React + TypeScript (strict mode), Vite, Mantine UI, Zustand state management, and Dexie.js (IndexedDB) for local storage. Deployed to GitHub Pages.

## Expected Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run format       # Prettier (includes prettier-plugin-gherkin for .feature files)
npm run typecheck    # tsc --noEmit
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
```

Run a single test file: `npx vitest run path/to/test.ts`

## Architecture

### Feature-Based Organization

Code lives in `src/features/{domain}/` (course, player, round, history, stats, settings, import-export). Each feature module has: `components/`, `hooks/`, `types.ts`, optional `store.ts`, and `index.ts` (public API re-exports).

Shared code goes in `src/components/`, `src/hooks/`, and `src/lib/`.

### State & Storage Split

- **Zustand stores** (`src/stores/`): session state only — app config (theme, language, units), active round state, transient UI state.
- **Dexie.js** (`src/storage/`): all persistent data (rounds, courses, players, settings). Accessed through a `StorageBackend` interface so cloud backends can be added later without changing feature code.

### Scoring Strategy Pattern

Scoring formats (stroke play, stableford) implement a `ScoringStrategy` interface. New formats are added by implementing the interface, not modifying existing code.

### Key Patterns

- All user-facing strings go through `react-i18next` (`t()` or `<Trans>`) — no hardcoded strings. Translations in `src/i18n/locales/en/`, namespaced per feature.
- All styling uses Mantine theme tokens — no hardcoded colors or spacing.
- Functional components and hooks only — no class components.

## Testing

**Gherkin-first BDD**: every feature gets `.feature` files in `features/{domain}/` before implementation.

- **Primary layer**: Gherkin + Vitest via `vitest-cucumber` — step definitions in `tests/steps/unit/`.
- **E2E** (Playwright): only for PWA install, service worker/offline, cross-page flows, browser-specific interactions. Step definitions in `tests/steps/e2e/`.
- **Plain Vitest**: for pure utility functions that don't map to Gherkin scenarios.

Pre-commit hooks (Husky) run lint + format on staged files.
