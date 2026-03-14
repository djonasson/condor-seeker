# Architecture

## Overview

Condor Seeker is a Progressive Web App (PWA) for golf scoring, statistics, and course management. It runs on mobile devices and desktop browsers, works offline, and stores data locally with a pluggable storage backend designed to support cloud providers in the future.

## Tech Stack

| Concern          | Choice                                          | Notes                                                  |
|------------------|-------------------------------------------------|--------------------------------------------------------|
| Language         | TypeScript                                      | Strict mode enabled                                    |
| Framework        | React                                           | Functional components, hooks only                      |
| Build tool       | Vite                                            | Fast dev server, optimized production builds           |
| PWA              | vite-plugin-pwa                                 | Workbox under the hood, auto service worker generation |
| State management | Zustand                                         | Lightweight, minimal boilerplate                       |
| Local storage    | Dexie.js (IndexedDB)                            | Structured data, querying, indexing, large capacity    |
| UI kit           | Mantine                                         | Theming, large component library, built-in hooks       |
| Styling          | Mantine built-in                                | CSS Modules + style props (Mantine's default approach) |
| Charts           | Recharts                                        | Declarative, React-native API                          |
| i18n             | react-i18next                                   | JSON translation files, English initially              |
| Unit testing     | Vitest                                          | Fast, Vite-native                                      |
| E2E testing      | Playwright                                      | Only where unit tests are insufficient                 |
| BDD              | Gherkin (vitest-cucumber + cucumber/Playwright) | Every feature specified in `.feature` files            |
| Linting          | ESLint                                          |                                                        |
| Formatting       | Prettier                                        | Use `prettier-plugin-gherkin` for our `.feature` files |
| Pre-commit hooks | Husky                                           | Runs lint + format on staged files                     |
| CI/CD            | GitHub Actions                                  | Build, test, deploy on push                            |
| Deployment       | GitHub Pages                                    | Static hosting, free                                   |

## Application Architecture

### Project Structure

```sh
condor-seeker/
├── public/                    # Static assets, PWA icons, manifest
├── src/
│   ├── app/                   # App entry point, providers, router setup
│   ├── components/            # Shared/reusable UI components
│   ├── features/              # Feature modules (see below)
│   │   ├── course/            # Golf course setup and management
│   │   ├── player/            # Player profiles and clubs
│   │   ├── round/             # Round setup, scorecard, live scoring
│   │   ├── history/           # Round history and saved rounds
│   │   ├── stats/             # Statistics and charts
│   │   ├── settings/          # App settings (units, theme, language)
│   │   └── import-export/     # Data import/export
│   ├── hooks/                 # Shared custom hooks
│   ├── i18n/                  # Translation files and i18n config
│   │   └── locales/
│   │       └── en/
│   ├── lib/                   # Utilities, helpers, constants
│   ├── storage/               # Storage abstraction layer
│   │   ├── backend.ts         # Storage backend interface
│   │   ├── dexie/             # Dexie.js (IndexedDB) implementation
│   │   └── types.ts           # Shared storage types
│   ├── stores/                # Zustand stores
│   └── theme/                 # Mantine theme configuration
├── features/                  # Gherkin .feature files
│   ├── course/
│   ├── player/
│   ├── round/
│   ├── history/
│   ├── stats/
│   ├── settings/
│   └── import-export/
├── tests/
│   ├── unit/                  # Vitest unit tests (mirrors src/ structure)
│   ├── e2e/                   # Playwright e2e tests
│   └── steps/                 # Gherkin step definitions
│       ├── unit/              # Step definitions for vitest-cucumber
│       └── e2e/               # Step definitions for cucumber + Playwright
├── docs/                      # Documentation
├── .github/
│   └── workflows/             # GitHub Actions CI/CD
└── index.html
```

### Feature Module Structure

Each feature module follows a consistent internal structure:

```sh
features/example/
├── components/       # Feature-specific components
├── hooks/            # Feature-specific hooks
├── types.ts          # Feature-specific types
├── store.ts          # Feature-specific Zustand store (if needed)
└── index.ts          # Public API (re-exports)
```

### Storage Abstraction Layer

Storage is accessed through a backend interface, allowing the local Dexie.js implementation to be swapped or extended with cloud backends (e.g., Google Drive) in the future without changing feature code.

```typescript
interface StorageBackend {
  // Rounds
  getRounds(): Promise<Round[]>;
  getRound(id: string): Promise<Round | undefined>;
  saveRound(round: Round): Promise<void>;
  deleteRound(id: string): Promise<void>;

  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  saveCourse(course: Course): Promise<void>;
  deleteCourse(id: string): Promise<void>;

  // Players
  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  savePlayer(player: Player): Promise<void>;
  deletePlayer(id: string): Promise<void>;

  // Settings
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;

  // Bulk operations (import/export)
  exportAll(): Promise<AppData>;
  importAll(data: AppData): Promise<void>;
}
```

The active storage backend is selected in app settings and provided via React context. Feature code interacts only with the `StorageBackend` interface.

## PWA Strategy

### Service Worker

- Generated automatically by `vite-plugin-pwa` using Workbox.
- **Precaching**: All app shell assets (HTML, JS, CSS, icons) are precached at install time.
- **Runtime caching**: Network-first for API calls (future cloud sync), cache-first for static assets.
- **Offline support**: The app is fully functional offline. All data operations go through the local Dexie.js database.

### Install Experience

- Custom install prompt using the `beforeinstallprompt` event.
- Manifest configured with app name, icons, theme color, and `display: standalone`.

## State Management

Zustand stores are organized by domain:

- **App store** — theme, language, units, active storage backend.
- **Round store** — current active round state (in-progress scoring).
- **UI store** — transient UI state (modals, navigation, loading states).

Persistent data (rounds, courses, players, settings) lives in the storage layer (Dexie.js), not in Zustand. Zustand holds only the active session state and acts as a cache for frequently accessed data.

## Theming

- Mantine's `MantineProvider` with a custom theme object.
- Light and dark mode support via Mantine's `colorScheme`.
- Custom color palette defined in the theme configuration.
- All components use Mantine's theme tokens — no hardcoded colors or spacing values.

## Internationalization (i18n)

- `react-i18next` configured with JSON translation files.
- Namespace-per-feature organization (e.g., `round.json`, `course.json`, `common.json`).
- All user-facing strings go through `t()` or the `<Trans>` component — no hardcoded strings in components.
- Language selection stored in app settings.
- Initial language: English (`en`).

## Testing Strategy

### Gherkin-First Development

Every feature is described in Gherkin `.feature` files before implementation. These files serve as both living documentation and executable test specifications.

```gherkin
# Example: features/round/scoring.feature
Feature: Hole-by-hole scoring

  Scenario: Enter a score for a hole
    Given a round is in progress on "Pine Valley" with 1 player
    And the current hole is hole 1 with par 4
    When the player enters a score of 5
    Then the hole score should show 5
    And the over/under indicator should show "+1"
    And the running total should be 5
```

### Test Pyramid

1. **Gherkin + Vitest (unit/integration)** — Primary testing layer. Step definitions use `vitest-cucumber` to test feature logic, stores, storage operations, and component rendering. This is where the vast majority of tests live.

2. **Gherkin + Playwright (e2e)** — Used only for scenarios that cannot be adequately tested at the unit level, such as:
   - PWA install flow
   - Service worker / offline behavior
   - Cross-page navigation flows
   - Browser-specific interactions (file download for export, etc.)

3. **Plain Vitest** — For pure utility functions, type guards, and helpers that don't map to a Gherkin scenario.

### Coverage

- Every feature must have complete Gherkin coverage before being considered done.
- CI pipeline fails if tests fail or if coverage drops below the configured threshold.

## CI/CD Pipeline (GitHub Actions)

```text
on push / PR:
  1. Install dependencies
  2. Lint (ESLint)
  3. Format check (Prettier)
  4. Type check (tsc --noEmit)
  5. Unit tests (Vitest)
  6. E2E tests (Playwright)
  7. Build

on push to main:
  8. Deploy to GitHub Pages
```

## Scoring System Design

The scoring engine is designed to be extensible:

- A `ScoringStrategy` interface defines how scores are calculated and displayed.
- Initial implementations: **Stroke Play** and **Stableford**.
- The interface is designed so additional formats (match play, best-ball, scramble, etc.) can be added without modifying existing code.

```typescript
interface ScoringStrategy {
  name: string;
  calculateHoleScore(grossScore: number, par: number, handicapStrokes: number): HoleResult;
  calculateRoundTotal(holeResults: HoleResult[]): RoundTotal;
  formatScore(score: HoleResult): string;
}
```

## Handicap Calculation

- Player handicap index is entered manually.
- Stroke allocation per hole is automatic based on hole handicap ranking and player course handicap.
- Net score = gross score - allocated strokes for that hole.
- The system does not post to official handicap systems (USGA/WHS) in the initial version.

## Data Model (Core Entities)

```typescript
interface Course {
  id: string;
  name: string;
  holes: Hole[];
  tees: Tee[];
}

interface Hole {
  number: number;
  parByTee: Record<string, number>;    // teeId -> par
  handicap: number;
  distanceByTee: Record<string, number>; // teeId -> distance
}

interface Tee {
  id: string;
  name: string;                // e.g., "White", "Blue", "Red"
  courseRating: number;
  slopeRating: number;
  totalDistance: number;
}

interface Player {
  id: string;
  name: string;
  handicapIndex: number;
  gender: string;
  clubs: Club[];
}

interface Club {
  id: string;
  type: string;               // e.g., "Driver", "7-iron", "Putter"
  brand: string;
  carryDistance: number;
}

interface Round {
  id: string;
  courseId: string;
  date: string;                // ISO 8601
  scoringSystem: string;       // "stroke" | "stableford" | ...
  playerRounds: PlayerRound[];
}

interface PlayerRound {
  playerId: string;
  teeId: string;
  holeScores: HoleScore[];
  totalGross: number;
  totalNet: number;
}

interface HoleScore {
  holeNumber: number;
  grossScore: number;
  netScore: number;
  putts?: number;
  fairwayHit?: boolean;       // null for par 3s
  greenInRegulation?: boolean;
}

interface Settings {
  distanceUnit: "meters" | "yards";
  temperatureUnit: "celsius" | "fahrenheit";
  theme: "light" | "dark";
  colorScheme: string;
  language: string;
  storageBackend: "local";     // Extensible for future backends
}
```

## Future Considerations

The following are explicitly **out of scope** for the initial version but the architecture accommodates them:

- **Cloud storage backends** (Google Drive, etc.) — The `StorageBackend` interface allows adding new implementations without changing feature code. Sync strategy (merge with conflict resolution) will be designed when this is implemented.
- **Additional scoring formats** — The `ScoringStrategy` interface supports adding new formats.
- **Watch apps** — Would consume the same data model.
- **GPS/rangefinder features** — Would add new feature modules under `src/features/`.
- **AI caddie / coaching** — Would add new feature modules with external API integrations.
