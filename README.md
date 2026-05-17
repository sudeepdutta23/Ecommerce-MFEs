<p align="center">
  <strong>⚡ HarborMart</strong>
</p>

<h1 align="center">Ecommerce Microfrontend Platform</h1>

<p align="center">
  A polyglot micro-frontend e-commerce platform built with
  <strong>React 19</strong>, <strong>Vue 3</strong>, and <strong>Angular 19</strong>,<br/>
  orchestrated through an <strong>Nx monorepo</strong> using <strong>Vite Module Federation</strong>.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="Vue" src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white" />
  <img alt="Angular" src="https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white" />
  <img alt="Nx" src="https://img.shields.io/badge/Nx-Monorepo-143055?logo=nx&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-Module_Fed-646CFF?logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8+-3178C6?logo=typescript&logoColor=white" />
</p>

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack Matrix](#tech-stack-matrix)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Development Workflows](#development-workflows)
- [Microfrontend Inventory](#microfrontend-inventory)
- [Shared Libraries](#shared-libraries)
- [Inter-MFE Communication](#inter-mfe-communication)
- [Port Allocation](#port-allocation)
- [Design Decisions](#design-decisions)
- [Nx Tooling](#nx-tooling)
- [Contributing](#contributing)

---

## Architecture Overview

HarborMart follows a **host/remote microfrontend architecture** where the **Shell** application acts as the orchestrator, dynamically loading independently built and deployed MFEs at runtime via [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/) and [Vite Module Federation](https://github.com/originjs/vite-plugin-federation).

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Shell (Host) — React 19                      │
│                          Port 3100 · Vite                           │
│                                                                     │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐         │
│   │ Home MFE │  │Products   │  │ Cart MFE │  │ Auth MFE │         │
│   │ React 19 │  │MFE        │  │  Vue 3   │  │  Vue 3   │         │
│   │ :3004    │  │React 19   │  │  Pinia   │  │  Pinia   │         │
│   │          │  │RTK Query  │  │  :3002   │  │  :3005   │         │
│   │          │  │:3001      │  │          │  │          │         │
│   └────┬─────┘  └────┬──────┘  └────┬─────┘  └────┬─────┘         │
│        │             │              │              │                │
│   Module Federation (Vite @originjs/vite-plugin-federation)        │
│                                                                     │
│   ┌──────────────────────┐                                          │
│   │  Checkout MFE        │                                          │
│   │  Angular 19 · :3003  │  ◄── iframe integration                 │
│   │  Webpack MF          │                                          │
│   └──────────────────────┘                                          │
│                                                                     │
│   ┌───────────────────────────────────────────────────────┐         │
│   │            @ecom/event-bus (CustomEvent IPC)          │         │
│   │            @ecom/types (Shared TS contracts)          │         │
│   └───────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

Each MFE is a **self-contained application** with its own framework, state management, build pipeline, and styling — capable of running independently for isolated development.

---

## Tech Stack Matrix

| MFE | Framework | Bundler | Federation Plugin | State Management | Styling |
|---|---|---|---|---|---|
| **Shell** (Host) | React 19 | Vite 8 | `@originjs/vite-plugin-federation` | React State + Event Bus | Vanilla CSS |
| **Home** | React 19 | Vite 7 | `@originjs/vite-plugin-federation` | — | Vanilla CSS |
| **Products** | React 19 | Vite 8 | `@originjs/vite-plugin-federation` | Redux Toolkit + RTK Query | Vanilla CSS |
| **Cart** | Vue 3 | Vite 8 | `@originjs/vite-plugin-federation` | Pinia + localStorage | Vanilla CSS |
| **Auth** | Vue 3 | Vite 8 | `@originjs/vite-plugin-federation` | Pinia | Vanilla CSS |
| **Checkout** | Angular 19 | Webpack 5 | `@angular-architects/module-federation` | Zustand (vanilla store) | SCSS |

### Tooling

| Tool | Purpose |
|---|---|
| **Nx** | Monorepo orchestration, task caching, dependency graph, affected commands |
| **npm workspaces** | Dependency hoisting across `apps/*` and `libs/shared/*` |
| **TypeScript** | Type safety across all MFEs and shared libraries |
| **ESLint + Prettier** | Code quality and formatting |
| **Lucide Icons** | Icon library (React: `lucide-react`, Vue: `lucide-vue-next`) |

---

## Project Structure

```
Ecommerce-MFEs/
├── apps/
│   ├── shell/                  # Host orchestrator (React 19)
│   │   ├── src/
│   │   │   ├── App.tsx         # Router, MFE loaders, error boundaries
│   │   │   ├── App.css         # Shell layout styles
│   │   │   └── types/          # Module declaration for remote imports
│   │   └── vite.config.ts      # Federation host config (5 remotes)
│   │
│   ├── home-mfe/               # Landing page (React 19)
│   │   ├── src/
│   │   │   ├── app/            # App component, carousel, promo cards
│   │   │   ├── bootstrap.tsx   # Mount/unmount lifecycle export
│   │   │   └── components/     # Home-specific components
│   │   └── vite.config.mts     # Federation remote config
│   │
│   ├── products-mfe/           # Product catalog (React 19 + RTK Query)
│   │   ├── src/
│   │   │   ├── bootstrap.tsx   # Mount/unmount + ProductsApp component
│   │   │   ├── store/          # Redux store, RTK Query API, slices
│   │   │   ├── components/     # ProductCard, etc.
│   │   │   ├── hooks/          # useAppStore, useAppDispatch
│   │   │   └── data/           # Mock product data
│   │   └── vite.config.ts      # Federation remote config
│   │
│   ├── cart-mfe/               # Shopping cart (Vue 3 + Pinia)
│   │   ├── src/
│   │   │   ├── bootstrap.ts    # Vue createApp + Pinia mount/unmount
│   │   │   ├── stores/         # Pinia cart store with localStorage
│   │   │   ├── components/     # Cart UI components
│   │   │   └── composables/    # Vue composition utilities
│   │   └── vite.config.ts      # Federation remote config
│   │
│   ├── auth-mfe/               # Authentication (Vue 3 + Pinia)
│   │   ├── src/
│   │   │   ├── bootstrap.ts    # Vue createApp mount/unmount
│   │   │   ├── stores/         # Auth state management
│   │   │   ├── components/     # Login/signup forms
│   │   │   └── composables/    # Auth composition utilities
│   │   └── vite.config.ts      # Federation remote config
│   │
│   └── checkout-mfe/           # Checkout flow (Angular 19)
│       ├── src/
│       │   ├── app/
│       │   │   ├── checkout/   # Checkout component, steps, indicator
│       │   │   └── services/   # Checkout service
│       │   └── main.ts         # Angular bootstrap
│       ├── store/              # Zustand checkout store
│       ├── webpack.config.js   # Module Federation remote config
│       └── angular.json        # Angular CLI configuration
│
├── libs/
│   └── shared/
│       ├── event-bus/          # @ecom/event-bus — cross-MFE pub/sub
│       │   └── src/index.ts    # emit(), on(), once() with type map
│       └── types/              # @ecom/types — shared domain models
│           └── src/index.ts    # Product, CartItem, CheckoutStep, etc.
│
├── scripts/
│   └── free-dev-ports.mjs      # Auto-kill stale processes on dev ports
│
├── nx.json                     # Nx workspace config, plugins, caching
├── tsconfig.base.json          # Shared TS config with @ecom/* path aliases
├── package.json                # Root scripts, workspaces, shared devDeps
└── .prettierrc                 # Code formatting rules
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/Ecommerce-MFEs.git
cd Ecommerce-MFEs

# Install all dependencies (root + all workspaces)
npm install
```

### Run Everything

```bash
# Start all 6 MFEs concurrently (builds remotes first, then serves)
npm run dev
```

This command will:

1. **Free stale ports** — runs `free-dev-ports.mjs` to kill any processes on MFE ports
2. **Build remotes** — produces federation-ready bundles for Home, Products, Cart, and Auth
3. **Start all servers** — launches each MFE on its designated port + the Shell host

Once running, open **http://localhost:3100** to see the full application.

---

## Development Workflows

### Run Everything (Full Platform)

```bash
npm run dev
```

### Run a Single MFE (Standalone Development)

Each MFE can be developed independently without the Shell:

```bash
# Products MFE standalone (React + RTK Query)
npm run dev:standalone:products    # → http://localhost:3001

# Cart MFE standalone (Vue + Pinia)
npm run dev:standalone:cart        # → http://localhost:3002

# Home MFE standalone (React)
npm run dev:standalone:home        # → http://localhost:3004

# Checkout MFE standalone (Angular)
npm run dev:checkout               # → http://localhost:3003

# Shell only (host)
npm run dev:shell                  # → http://localhost:3100
```

### Build Commands

```bash
# Build all remote MFEs (federation bundles)
npm run build:remotes

# Build everything (all projects)
npm run build:all

# Build only affected projects (based on git changes)
npm run build:affected
```

### Lint Commands

```bash
# Lint all projects
npm run lint:all

# Lint only affected projects
npm run lint:affected
```

### Port Management

```bash
# Kill all stale processes on MFE ports
npm run ports:free

# Force-kill (including non-workspace processes)
npm run ports:free:force
```

---

## Microfrontend Inventory

### Shell (Host Orchestrator)

The Shell is the **top-level container** that handles:

- **Routing** — React Router v7 maps URL paths to MFE loaders (`/`, `/products`, `/cart`, `/auth`, `/checkout`)
- **Dynamic Remote Loading** — `React.lazy()` + dynamic `import()` loads each MFE on demand
- **Error Boundaries** — per-MFE `MfeErrorBoundary` with retry capability; a failing remote never crashes the Shell
- **Graceful Fallbacks** — if a remote is offline, a developer-friendly card shows the port and start command
- **Global Navigation** — Amazon-inspired navbar with search, categories, cart badge, and user account
- **Event Listening** — subscribes to `ecom:cart:updated` to update the cart count badge

**Federation role:** Host — consumes 5 remotes  
**Exposed modules:** None (this is the host)

---

### Home MFE

The landing page with hero carousel, promotional cards, and featured product sections.

| | |
|---|---|
| **Framework** | React 19 |
| **Port** | 3004 |
| **Federation** | Exposes `./App` via `bootstrap.tsx` |
| **Mount pattern** | `mountHome(el: HTMLElement): () => void` |
| **State** | Local component state |

---

### Products MFE

Full product catalog with search, category filtering, sorting, grid/list views, product detail modal, and "add to cart" toast notifications.

| | |
|---|---|
| **Framework** | React 19 |
| **Port** | 3001 |
| **Federation** | Exposes `./App` via `bootstrap.tsx` |
| **Mount pattern** | `mountProducts(el: HTMLElement): () => void` |
| **State** | Redux Toolkit (`configureStore`) + RTK Query for data fetching |
| **Events emitted** | `ecom:cart:add` — when user adds a product to cart |

---

### Cart MFE

Shopping cart with item management, quantity controls, price calculations (subtotal, shipping, tax), and localStorage persistence.

| | |
|---|---|
| **Framework** | Vue 3 (Composition API) |
| **Port** | 3002 |
| **Federation** | Exposes `./CartApp` via `bootstrap.ts` |
| **Mount pattern** | `mountCart(el: HTMLElement): () => void` |
| **State** | Pinia store with `localStorage` persistence |
| **Events emitted** | `ecom:cart:updated` — broadcasts current cart count |
| **Events consumed** | `ecom:cart:add` — listens for products added from Products MFE |

---

### Auth MFE

User authentication interface with login/signup forms.

| | |
|---|---|
| **Framework** | Vue 3 (Composition API) |
| **Port** | 3005 |
| **Federation** | Exposes `./AuthApp` via `bootstrap.ts` |
| **Mount pattern** | `mountAuth(el: HTMLElement): () => void` |
| **State** | Pinia |
| **Events emitted** | `auth:login_success` — notifies Shell on successful authentication |

---

### Checkout MFE

Multi-step checkout flow with cart review, address input, payment selection, and order confirmation.

| | |
|---|---|
| **Framework** | Angular 19 (standalone components) |
| **Port** | 3003 |
| **Federation** | `@angular-architects/module-federation` — exposes `./CheckoutComponent` |
| **Integration** | Loaded via **iframe** in the Shell |
| **State** | Zustand (framework-agnostic vanilla store) |
| **Events emitted** | `ecom:checkout:complete` — broadcasts order confirmation |

---

## Shared Libraries

### `@ecom/event-bus`

**Path:** `libs/shared/event-bus/src/index.ts`  
**Alias:** `@ecom/event-bus` (via `tsconfig.base.json`)

A type-safe, zero-dependency inter-MFE communication layer built on browser `CustomEvent`:

```typescript
import { emit, on, once } from '@ecom/event-bus'

// Emit an event (type-checked payload)
emit('ecom:cart:add', {
  product: { id: '1', name: 'Widget', price: 29.99, image: '...', brand: 'Acme' }
})

// Subscribe to an event (returns unsubscribe function)
const off = on('ecom:cart:updated', ({ count }) => {
  console.log(`Cart now has ${count} items`)
})

// One-time listener
once('ecom:checkout:complete', ({ orderNumber }) => {
  console.log(`Order ${orderNumber} placed!`)
})
```

**API:**

| Function | Signature | Description |
|---|---|---|
| `emit` | `emit<K>(name: K, ...payload): void` | Dispatch a typed `CustomEvent` on `window` |
| `on` | `on<K>(name: K, handler): () => void` | Subscribe to an event; returns unsubscribe fn |
| `once` | `once<K>(name: K, handler): () => void` | Subscribe once; auto-unsubscribes after first fire |

---

### `@ecom/types`

**Path:** `libs/shared/types/src/index.ts`  
**Alias:** `@ecom/types` (via `tsconfig.base.json`)

Shared TypeScript domain models consumed by all MFEs:

| Type | Fields | Used By |
|---|---|---|
| `Product` | `id`, `name`, `brand`, `category`, `price`, `originalPrice`, `image`, `description`, `rating`, `reviewCount`, `stock`, `tags`, `badge`, `colors` | Products, Cart, Checkout |
| `ProductFilters` | `category?`, `search?`, `maxPrice?`, `sortBy?` | Products |
| `CartItem` | `id`, `name`, `brand`, `price`, `image`, `quantity` | Cart, Checkout |
| `CheckoutStep` | `'shipping' \| 'payment' \| 'review'` | Checkout |
| `ShippingInfo` | `firstName`, `lastName`, `email`, `address`, `city`, `state`, `zip`, `country` | Checkout |
| `PaymentInfo` | `cardNumber`, `expiry`, `cvv`, `nameOnCard` | Checkout |

---

## Inter-MFE Communication

All MFEs communicate through the **shared event bus** — there are no direct imports or runtime coupling between microfrontends.

### Event Catalog

```
┌─────────────┐    ecom:cart:add     ┌─────────────┐
│  Products   │ ──────────────────►  │    Cart      │
│    MFE      │                      │    MFE       │
└─────────────┘                      └──────┬───────┘
                                            │
                                   ecom:cart:updated
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │   Shell      │
                                     │  (badge)     │
                                     └──────┬───────┘
                                            │
                                   ecom:checkout:start
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │  Checkout    │
                                     │    MFE       │
                                     └──────┬───────┘
                                            │
                                  ecom:checkout:complete
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │   Shell      │
                                     │  (confirm)   │
                                     └─────────────┘
```

| Event | Payload | Producer | Consumer(s) |
|---|---|---|---|
| `ecom:cart:add` | `{ product: { id, name, price, image, brand } }` | Products MFE | Cart MFE |
| `ecom:cart:updated` | `{ count: number }` | Cart MFE | Shell (navbar badge) |
| `ecom:cart:remove` | `{ productId: string }` | Cart MFE | — |
| `ecom:cart:clear` | `undefined` | Cart MFE | — |
| `ecom:checkout:start` | `{ items: Array<{ id, quantity }> }` | Cart MFE | Shell (navigation) |
| `ecom:checkout:complete` | `{ orderNumber: string }` | Checkout MFE | Shell |
| `ecom:navigation:change` | `{ path: string }` | Any | Shell |

### Data Flow Example: Add to Cart

1. User clicks **"Add to Cart"** on a product card in `products-mfe`
2. Products MFE calls `emit('ecom:cart:add', { product: {...} })`
3. Cart MFE receives via `on('ecom:cart:add', handler)` and updates its Pinia store
4. Cart MFE calls `emit('ecom:cart:updated', { count: totalItems })`
5. Shell receives via `on('ecom:cart:updated', handler)` and updates the navbar badge

---

## Port Allocation

| Port | Application | Framework |
|---|---|---|
| `3001` | Products MFE | React |
| `3002` | Cart MFE | Vue |
| `3003` | Checkout MFE | Angular |
| `3004` | Home MFE | React |
| `3005` | Auth MFE | Vue |
| `3100` | Shell (Host) | React |

All ports use `strictPort: true` to fail fast if the port is occupied.

The `scripts/free-dev-ports.mjs` utility runs as a `predev` hook to automatically detect and terminate stale processes on these ports. It uses `lsof` (macOS/Linux) or `ss` (Linux fallback) to find processes and gracefully terminates them with `SIGTERM` before falling back to `SIGKILL`.

```bash
# Manual usage
node scripts/free-dev-ports.mjs all          # Free all ports
node scripts/free-dev-ports.mjs products     # Free port 3001 only
FREE_DEV_PORTS_FORCE=1 node scripts/free-dev-ports.mjs all  # Force-kill non-workspace processes
```

---

## Design Decisions

### Why Polyglot (React + Vue + Angular)?

This project deliberately uses three different frontend frameworks to demonstrate that microfrontend architecture enables **true technology independence**. Each team can choose the best tool for their domain:

- **React** — Shell, Home, Products — rich ecosystem for complex UI and data fetching (RTK Query)
- **Vue** — Cart, Auth — lightweight, reactive, excellent for self-contained feature modules
- **Angular** — Checkout — enterprise-grade forms, validation, and multi-step workflows

### Why Vite Module Federation?

`@originjs/vite-plugin-federation` provides native ESM-based module federation without requiring Webpack. This enables:

- Faster build times via Vite's esbuild/Rollup pipeline
- Hot Module Replacement during development
- Tree-shaking of remote modules

The Angular Checkout MFE uses `@angular-architects/module-federation` with Webpack because Angular CLI does not natively support Vite Module Federation.

### Why CustomEvent for IPC?

The event bus uses browser-native `CustomEvent` instead of a shared state store because:

- **Zero coupling** — MFEs don't need to import each other's stores
- **Framework agnostic** — works identically in React, Vue, and Angular
- **Type-safe** — `EcomEventMap` interface provides compile-time checking
- **No runtime overhead** — native browser API with no library weight

### Why Zustand in Angular?

The Checkout MFE uses Zustand (typically a React library) because its `create()` function returns a **vanilla JavaScript store** with `getState()`, `setState()`, and `subscribe()` — no React dependency required. This enables the same state management patterns across framework boundaries while consuming the `@ecom/event-bus` and `@ecom/types` shared contracts.

### Bootstrap / Mount Pattern

Every MFE exports a `mount(el: HTMLElement): () => void` function from its `bootstrap.ts(x)`. This is the **universal contract** that the Shell uses to load any remote regardless of framework:

```typescript
// React MFE
export default function mountProducts(el: HTMLElement) {
  const root = createRoot(el)
  root.render(<App />)
  return () => root.unmount()
}

// Vue MFE
export default function mountCart(el: HTMLElement) {
  const app = createApp(App)
  app.use(createPinia())
  app.mount(el)
  return () => app.unmount()
}
```

The Shell wraps each mount function in a `React.lazy()` component with a `useRef` container and `useEffect` lifecycle, ensuring proper mount/unmount on route changes.

---

## Nx Tooling

### Dependency Graph

Visualize the complete project dependency graph:

```bash
npm run graph        # Opens Nx interactive graph in browser
# or
npx nx graph
```

### Smart Caching

Nx caches `build` and `lint` targets by default. The `nx.json` configures:

- **Named inputs** — `production` inputs exclude test files and ESLint configs
- **Target defaults** — `build` tasks depend on upstream builds (`^build`)
- **Plugin inference** — `@nx/vite/plugin` and `@nx/next/plugin` auto-detect targets

### Affected Commands

Only build/lint/test what changed based on git diff:

```bash
npm run build:affected    # Build only changed projects
npm run lint:affected     # Lint only changed projects
```

### Project Tags

Each MFE is tagged for boundary enforcement:

| Project | Tags |
|---|---|
| `shell` | `scope:shell`, `type:app`, `framework:react` |
| `products-mfe` | `scope:products`, `type:mfe`, `framework:react` |
| `cart-mfe` | `scope:cart`, `type:mfe`, `framework:vue` |
| `auth-mfe` | `scope:auth`, `type:mfe`, `framework:vue` |
| `checkout-mfe` | `scope:checkout`, `type:mfe`, `framework:angular` |
| `home-mfe` | *(not yet tagged)* |

### Resetting Nx Cache

```bash
npm run reset      # Clears all Nx caches
# or
npx nx reset
```

---

## Contributing

### Branch Strategy

```
main ← develop ← feature/[mfe-name]-[description]
```

### Development Checklist

1. **Run standalone first** — validate your MFE in isolation before testing in the Shell
2. **Use the event bus** — never import directly from another MFE's source
3. **Type your events** — add new event types to `EcomEventMap` in `@ecom/event-bus`
4. **Add shared types** — domain models used across MFEs go in `@ecom/types`
5. **Tag your project** — set appropriate `tags` in your MFE's `project.json`
6. **Test with Shell** — run `npm run dev` to verify integration before submitting a PR

### Adding a New MFE

1. Create a new app in `apps/[name]-mfe/`
2. Add a `bootstrap.ts(x)` that exports `mount(el): () => void`
3. Configure Module Federation in `vite.config.ts` (or `webpack.config.js` for Angular)
4. Register the remote in `apps/shell/vite.config.ts`
5. Add a type declaration in `apps/shell/src/types/`
6. Create a lazy loader + error boundary in `apps/shell/src/App.tsx`
7. Add the route to the Shell's `<Routes>`
8. Add the port to `scripts/free-dev-ports.mjs`
9. Update `implicitDependencies` in `apps/shell/project.json`
10. Add a `project.json` with appropriate `tags`

---

<p align="center">
  Built with ⚡ by the HarborMart team
</p>
