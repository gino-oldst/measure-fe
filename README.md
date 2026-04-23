# Project Measure — Web

React web app for the Mariana UFP dashboard (alerts, behaviours, restricted list).

---

## Prerequisites

You need **one** of:

- **Node 20.x LTS** via [nvm](https://github.com/nvm-sh/nvm) (recommended — faster, no container overhead)
- **Docker Desktop** (fallback — uses a pinned legacy image)

You also need the backend running and reachable at the URL in your local `.env` (see [Environment](#environment) below).

---

## Quick Start — Native npm (recommended)

```bash
nvm use              # reads .nvmrc → Node 20 LTS (installs it via `nvm install lts/iron` if missing)
npm install          # .npmrc pins legacy-peer-deps=true
npm start            # http://localhost:3000
```

The native path works on any modern Node because of three compatibility shims committed to this repo:

- `sass` (dart-sass) replaces the unmaintainable `node-sass@4.14.1`
- `.npmrc` has `legacy-peer-deps=true` — bypasses npm 7+ strict peer-dep enforcement (react-scripts 4 + Storybook 6 have loose peer ranges)
- All webpack scripts set `NODE_OPTIONS=--openssl-legacy-provider` — enables webpack 4's MD4 hashing on Node 17+ (OpenSSL 3)

---

## Alternative — Docker

Kept as a fallback for machines where Node 20 isn't an option:

```bash
docker compose build     # first time, or after package.json changes
docker compose up        # http://localhost:3000
```

| Task | Command |
|---|---|
| Background + tail logs | `docker compose up -d && docker compose logs -f` |
| Stop | `docker compose down` |
| Install a new dep | `docker compose run --rm app npm install <pkg> && docker compose build` |

> The image is pinned to `node:14-buster` (with Debian archive repos) for historical compatibility. The native path is preferred on modern hardware.

---

## Environment

Three env files, one per target:

| File | Loaded by |
|---|---|
| `.env` | `npm start`, `npm run build` |
| `.env.staging` | `npm run start:staging`, `npm run build:staging` |
| `.env.production` | `npm run start:prod`, `npm run build:prod` |

Required keys:

```
REACT_APP_SITE_TITLE
REACT_APP_NAV_TITLE
REACT_APP_API_HOST                    # e.g. http://127.0.0.1:7001
REACT_APP_X_API_KEY
REACT_APP_SECRET_KEY
REACT_APP_CLIENT_CREDENTIALS_INTERNAL
```

**CRA reads env vars only at startup** — restart `npm start` after editing `.env`.

---

## Scripts

| Script | What it does |
|---|---|
| `npm start` | Dev server with `.env` |
| `npm run start:staging` | Dev server with `.env.staging` |
| `npm run start:prod` | Dev server with `.env.production` |
| `npm run build` | Production bundle with `.env` → `build/` |
| `npm run build:staging` | Production bundle with `.env.staging` |
| `npm run build:prod` | Production bundle with `.env.production` |
| `npm test` | Jest |
| `npm run release` | Conventional-commit-driven version bump + CHANGELOG + tag |
| `npm run release:first` | One-time release seed (adds `--first-release`) |
| `npm run create route X` | Scaffold a new route (`domakey`) |
| `npm run create component X` | Scaffold a new component (`domakey`) |

### Serve a production bundle locally

```bash
npm run build:prod
npx serve -s build -l 3001    # http://localhost:3001
```

---

## Releasing / Versioning

The current version is displayed at the bottom of the sidebar once logged in. It's read from `package.json#version` at build time, so each deployed bundle reflects whatever version was in `package.json` when it was built.

Versioning is automated via [`commit-and-tag-version`](https://github.com/absolute-version/commit-and-tag-version) and driven entirely by [conventional commits](https://www.conventionalcommits.org/).

### First release (one-time)

```bash
npm run release:first
git push --follow-tags origin development
```

Seeds `v1.0.0`, creates `CHANGELOG.md`, commits `chore(release): 1.0.0`, and places the `v1.0.0` tag.

### Subsequent releases

```bash
npm run release
git push --follow-tags origin development
```

The tool reads commits since the last tag and auto-bumps:

| Commit type | Bump | Example |
|---|---|---|
| `fix:` | patch | 1.0.0 → 1.0.1 |
| `feat:` | minor | 1.0.0 → 1.1.0 |
| `BREAKING CHANGE:` in body | major | 1.0.0 → 2.0.0 |

`chore` / `test` / `ci` / `style` commits trigger a patch bump but are hidden from `CHANGELOG.md` (configured in `.versionrc.json`).

### Dry run

```bash
npm run release -- --dry-run
```

---

## Code generation (`domakey`)

### Routes

```bash
npm run create route MyNewRoute
```

Creates:

```
containers/MyNewRoute/
├── MyNewRouteContainer.js
├── MyNewRouteScreen.js
└── my-new-route.scss
```

Also adds an entry to `src/config/routes.js`.

### Components

```bash
npm run create component MyNewComponent
```

Creates:

```
components/MyNewComponent/
├── MyNewComponent.js
├── MyNewComponent.stories.js
└── my-new-component.scss
```

---

## Branching model

- `master` — production releases
- `development` — integration branch; all feature/fix branches target this
- `feat/*`, `fix/*`, `chore/*` — work branches

PRs target `development`. Release merges from `development` → `master` happen at tag cut time.

---

## Known warnings (pre-existing)

These surface in dev console or build output and are not caused by recent changes:

- `Spinner children expected string` — reactstrap API change
- `findDOMNode deprecated in StrictMode` — `react-onclickoutside` library
- `createMuiTheme renamed to createTheme` — Material-UI v4 legacy API
- ESLint: `Breadcrumbs` href, unused `isTabletOrMobile` in `AlertDetailScreen`, missing map return in `AlertsScreen`

Tracking for later cleanup — do not block on these.
