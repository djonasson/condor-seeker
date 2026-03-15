# Condor Seeker

A Progressive Web App for golf scoring, statistics, and course management. Works offline, runs on any device with a browser.

## Features

- **Player management** — Create player profiles with handicap index and club bag
- **Course management** — Add courses manually or import from JSON, with per-hole par, handicap, and distance data for multiple tee boxes
- **Live scoring** — Hole-by-hole score entry with gross/net calculation, putts, fairways hit, and greens in regulation
- **Scoring systems** — Stroke play and Stableford, extensible via a strategy pattern
- **Handicap support** — Automatic stroke allocation based on course/slope rating and hole handicap
- **Round history** — Browse and review past rounds with full scorecards
- **Statistics** — Scoring average, putts, FIR%, GIR%, trends over time, per-course breakdowns
- **Import/Export** — Full data backup and restore via JSON files
- **PWA** — Installable, works offline, precached app shell

## Tech Stack

| Concern   | Choice                                               |
| --------- | ---------------------------------------------------- |
| Language  | TypeScript (strict mode)                             |
| Framework | React 19                                             |
| Build     | Vite                                                 |
| UI        | Mantine                                              |
| State     | Zustand (session) + Dexie.js/IndexedDB (persistence) |
| i18n      | react-i18next                                        |
| Charts    | Recharts                                             |
| Testing   | Vitest + Playwright                                  |
| PWA       | vite-plugin-pwa (Workbox)                            |

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run format       # Prettier
npm run typecheck    # TypeScript type checking
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

## Project Structure

```
src/
├── app/           # Entry point, providers, router, layout
├── components/    # Shared UI components
├── features/      # Feature modules
│   ├── course/    # Course management
│   ├── player/    # Player profiles and clubs
│   ├── round/     # Round setup, scorecard, scoring engine
│   ├── history/   # Round history
│   ├── stats/     # Statistics and charts
│   ├── settings/  # App settings
│   └── import-export/
├── hooks/         # Shared hooks
├── i18n/          # Translations (English)
├── lib/           # Utilities (handicap calc, route hierarchy)
├── storage/       # StorageBackend interface + Dexie implementation
├── stores/        # Zustand stores (app, round, UI)
└── theme/         # Mantine theme config
```

## License

See [LICENSE](LICENSE).
