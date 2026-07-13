# Ecom Frontend — Microfrontend Monorepo

A production-ready React microfrontend architecture built with **TypeScript**, **Tailwind CSS**, and **Webpack 5 Module Federation**. Each microfrontend (MFE) is independently developed, built, deployed, and versioned, then composed at runtime by a host shell.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  apps/shell  (host, :3000)                                     │
│  layout · navigation · auth bootstrap · remote registry       │
│  loads remoteEntry.js at RUNTIME from env-configured URLs     │
└───────┬──────────────────┬──────────────────┬──────────────────┘
        │ /account/*       │ /catalog/*       │ /analytics/*
┌───────▼───────┐  ┌───────▼────────┐  ┌──────▼─────────┐
│ auth-dashboard │  │ product-catalog│  │ analytics      │
│ (:3001)        │  │ (:3002)        │  │ (:3003)        │
│ Redux Toolkit  │  │ MobX           │  │ Zustand        │
└───────┬───────┘  └───────┬────────┘  └──────┬─────────┘
        │                  │                  │
        └───── typed event bus (CustomEvents) ┘
              contract: packages/types MfeEventMap

shared packages (source-consumed, no build step):
  @ecom/ui      design-system primitives (UI only)
  @ecom/config  Tailwind preset · tsconfig base · webpack MFE factory
  @ecom/types   domain models · event map · remote contracts
  @ecom/utils   event bus · API client · auth session · formatters
```

### Key decisions

| Concern                 | Decision                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Composition             | Runtime dynamic Module Federation — the shell has **no build-time remote URLs**; `remotes.config.ts` + `REMOTE_*` env vars drive everything |
| State                   | Isolated per MFE (RTK / MobX / Zustand). No global store, no store sharing                                                                  |
| Cross-MFE communication | Typed event bus (`@ecom/utils`) over a contract (`MfeEventMap` in `@ecom/types`), plus props/URL params                                     |
| Shared deps             | Only true singletons: `react`, `react-dom`, `react-router-dom`                                                                              |
| Styling                 | Shared Tailwind **preset** (design tokens) in `@ecom/config`; each app compiles its own CSS and may extend locally                          |
| Routing                 | Shell owns the `BrowserRouter`; each remote exposes relative `<Routes>` mounted under `/<segment>/*`                                        |
| Resilience              | Every remote renders inside an error boundary + Suspense fallback, with retry that re-attempts the federation load                          |
| Independence            | Every remote runs standalone (`pnpm dev` in its folder) and exposes a framework-agnostic `./mount` in addition to `./App`                   |

## Getting started

Prerequisites: Node ≥ 18.17 and pnpm 9 (`corepack enable` will provision it).

```bash
pnpm install

# run everything (shell :3000 + all remotes :3001-:3003)
pnpm dev

# or run apps individually — every remote works standalone
pnpm --filter @ecom/product-catalog dev   # http://localhost:3002
pnpm dev:shell                            # host only
```

Open http://localhost:3000. Sign in under **Account** (any email + 4-char password), add products under **Catalog**, and watch **Analytics** react — three state libraries, zero shared stores.

### Other commands

```bash
pnpm build         # production build of all apps (turbo, cached)
pnpm typecheck     # tsc --noEmit across the workspace
pnpm lint          # eslint (flat config, typescript-eslint strict-ish)
pnpm format        # prettier
```

## Environment configuration

The shell resolves remotes from env vars (see `apps/shell/.env.example`; copy to `.env` to override the localhost defaults):

```
REMOTE_AUTH_DASHBOARD_URL=https://auth.cdn.example.com/remoteEntry.js
REMOTE_PRODUCT_CATALOG_URL=https://catalog.cdn.example.com/remoteEntry.js
REMOTE_ANALYTICS_URL=https://analytics.cdn.example.com/remoteEntry.js
```

Only env vars prefixed `REMOTE_`, `API_`, or `APP_` are inlined into bundles (see `packages/config/webpack/create-mfe-config.js`).

## Adding a new microfrontend (plug-and-play)

See [docs/ADDING_A_REMOTE.md](docs/ADDING_A_REMOTE.md) for the full walkthrough. Summary:

1. Copy an existing remote (e.g. `apps/analytics`) to `apps/<new-app>`; update `package.json` name and the `name`/`port` in `webpack.config.js`.
2. Build your features; expose `./App` (and optionally `./mount`).
3. Register it in the shell: one entry in `apps/shell/src/remotes/remotes.config.ts` + one `REMOTE_<NAME>_URL` env var.

That's it — routing, navigation, error boundaries, and loading states are generated from the registry. Removing an MFE is deleting its entry.

## Deployment

Each app builds to a self-contained `dist/` (`publicPath: 'auto'`), so any static host/CDN works:

1. **Remotes:** `pnpm --filter @ecom/<app> build` → upload `dist/` to the app's own origin/CDN path. `remoteEntry.js` must be served with CORS allowed for the shell's origin. Cache `remoteEntry.js` with a short TTL (it's the version pointer); hashed assets can be cached forever.
2. **Shell:** build with production `REMOTE_*_URL`s set → upload `dist/` behind your domain with SPA fallback (all routes → `index.html`).
3. Deploys are independent: shipping a new remote version is just replacing that remote's files — no shell rebuild, no coordinated release. Version remotes by deploying to versioned paths (e.g. `/v1.4.2/remoteEntry.js`) and flipping the env var if you need instant rollback.

## Conventions

- **Feature folders** inside each MFE (`src/features/<feature>/…`); `@/*` path alias → `src/*`.
- **State stays home.** If two MFEs need to know the same thing, either lift it to a URL param/prop or define an event in `MfeEventMap`. Never export a store.
- **Shared packages stay small.** `@ecom/ui` is UI primitives only; business components live in the MFE that owns them.
- **TypeScript strict mode** everywhere (`tsconfig.base.json`), single flat ESLint config at the root, Prettier for formatting.
