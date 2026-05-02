# E-Commerce Microfrontend Platform - Architecture Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Monorepo Structure](#monorepo-structure)
5. [Module Federation Setup](#module-federation-setup)
6. [Micro Frontends Overview](#micro-frontends-overview)
7. [Shared Package](#shared-package)
8. [Communication Patterns](#communication-patterns)
9. [State Management](#state-management)
10. [Build & Deployment](#build--deployment)
11. [Development Workflow](#development-workflow)
12. [Ports & Services](#ports--services)
13. [Design Patterns](#design-patterns)
14. [Dependencies & Sharing](#dependencies--sharing)

---

## Project Overview

**E-commerce Microfrontend Platform** is a polyglot, modular e-commerce application built using **Module Federation** pattern to enable independent development, deployment, and scaling of different business features.

### Key Characteristics

- **Polyglot Architecture**: Uses Next.js, React, Angular, and Vue.js in the same application
- **Module Federation**: Enables runtime composition of independent applications
- **Monorepo Management**: Turborepo orchestrates building and development across packages
- **Team Ownership**: Each microfrontend is owned by a separate team
- **Shared Utilities**: Common types, utilities, and event bus centralized in a shared package
- **Independent Deployments**: Each MFE can be deployed independently

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHELL (Host Application)                         │
│                  Next.js (Pages Router) - Port 3000                 │
│              Module Federation Consumer (Host/Container)            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │    HOME      │  │   PRODUCT    │  │    CART      │              │
│  │  (React)     │  │   (React)    │  │   (React)    │              │
│  │   :3001      │  │    :3002     │  │    :3003     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  CHECKOUT    │  │   PROFILE    │  │    ADMIN     │              │
│  │  (Angular)   │  │   (React)    │  │  (Next.js)   │              │
│  │    :3004     │  │    :3005     │  │    :3006     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│                      ┌──────────────────┐                           │
│                      │  SHARED Package  │                           │
│                      │ (Event Bus, Types)                           │
│                      └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌──────────────────┐
                      │  Event Bus       │
                      │ Cross-MFE Comms  │
                      └──────────────────┘
```

---

## Technology Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Monorepo** | Turborepo | ^2.0.0 | Build orchestration & task scheduling |
| **Package Manager** | npm | 10.0.0 | Dependency management |
| **Build Tool** | Module Federation | - | Runtime composition & code sharing |
| **Node.js** | Node.js | >=18.0.0 | Runtime environment |

### Micro Frontend Frameworks

| MFE | Framework | Build Tool | Package Name |
|-----|-----------|-----------|--------------|
| Shell (Host) | Next.js 14 | webpack (built-in) | @ecommerce/shell |
| Home | React 18 | Vite | @ecommerce/home |
| Product | React 18 | Vite | @ecommerce/product |
| Cart | React 18 | Vite | @ecommerce/cart |
| Checkout | Angular 17 | Angular CLI | @ecommerce/checkout |
| Profile | React 18 | Vite | @ecommerce/profile |
| Admin | Next.js 14 | webpack (built-in) | @ecommerce/admin |

### State Management & Utilities

| Tool | Purpose | Used In |
|------|---------|---------|
| Zustand | State management | React MFEs (Home, Product, Cart, Profile, Admin) |
| RxJS | Reactive programming | Angular MFE (Checkout) |
| Custom Event Bus | Cross-MFE communication | All MFEs |
| TypeScript | Type safety | All MFEs |

---

## Monorepo Structure

```
ecommerce-microfrontend/
├── packages/
│   ├── shell/                    # Host Application (Next.js)
│   │   ├── pages/                # Next.js pages (routing)
│   │   ├── src/
│   │   │   ├── components/       # Layout components (Header, Footer)
│   │   │   ├── styles/           # Global styles
│   │   │   └── federation.d.ts   # Module Federation type defs
│   │   ├── next.config.js        # Module Federation config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── home/                     # Home MFE (React + Vite)
│   │   ├── src/
│   │   │   ├── components/       # Page components
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Categories.tsx
│   │   │   │   ├── FeaturedProducts.tsx
│   │   │   │   └── ... (other components)
│   │   │   ├── styles/
│   │   │   └── main.tsx          # Entry point
│   │   ├── vite.config.ts        # Module Federation config
│   │   └── package.json
│   │
│   ├── product/                  # Product MFE (React + Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ProductList.tsx
│   │   │   │   ├── ProductDetail.tsx
│   │   │   │   └── ... (other components)
│   │   │   ├── store/            # Zustand store
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── cart/                     # Cart MFE (React + Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── CartWidget.tsx
│   │   │   │   ├── CartPage.tsx
│   │   │   │   └── ... (other components)
│   │   │   ├── stores/           # Zustand store
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── checkout/                 # Checkout MFE (Angular)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.component.ts      # Root component
│   │   │   │   ├── checkout/             # Business logic
│   │   │   │   └── ... (other features)
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   └── styles.css
│   │   ├── angular.json          # Angular CLI config
│   │   └── package.json
│   │
│   ├── profile/                  # Profile MFE (React + Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Profile.tsx
│   │   │   │   ├── OrderHistory.tsx
│   │   │   │   └── ... (other components)
│   │   │   ├── store/            # Zustand store
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── admin/                    # Admin MFE (Next.js)
│   │   ├── pages/                # Next.js pages
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── AdminDashboard.tsx
│   │   │   └── styles/
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   └── shared/                   # Shared utilities & types
│       ├── src/
│       │   ├── index.ts          # Main export
│       │   ├── types.ts          # Shared TypeScript types
│       │   │   ├── Product interface
│       │   │   ├── Cart interface
│       │   │   ├── User interface
│       │   │   ├── Order interface
│       │   │   └── ... (other types)
│       │   └── eventBus.ts       # Event bus implementation
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                  # Workspace root config
├── turbo.json                    # Turborepo config
└── README.md
```

---

## Module Federation Setup

### What is Module Federation?

Module Federation is a webpack feature that allows multiple JavaScript applications to share code at runtime without tight coupling. Each application is independently deployable and can be updated without affecting the host.

### Host Configuration (Shell - Next.js)

**File**: `packages/shell/next.config.js`

The Shell acts as a **Host** that consumes remote modules from other MFEs:

```javascript
const remotes = (isServer) => {
  const location = isServer ? 'ssr' : 'chunks';
  return {
    home: `home@http://localhost:3001/_next/static/${location}/remoteEntry.js`,
    product: `product@http://localhost:3002/_next/static/${location}/remoteEntry.js`,
    cart: `cart@http://localhost:3003/assets/remoteEntry.js`,
    checkout: `checkout@http://localhost:3004/remoteEntry.js`,
    profile: `profile@http://localhost:3005/assets/remoteEntry.js`,
    admin: `admin@http://localhost:3006/_next/static/${location}/remoteEntry.js`,
  };
};
```

**Key Points**:
- Each remote entry points to the MFE's URL
- Shared dependencies (React, React-DOM) configured with singleton pattern
- Different paths for server-side rendering (ssr) vs client-side (chunks)

### Remote Configuration (Vite-based MFEs)

**File Example**: `packages/home/vite.config.ts`

```typescript
export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'home',
            filename: 'remoteEntry.js',
            exposes: {
                './Home': './src/components/Home',
            },
            shared: ['react', 'react-dom'],
        }),
    ],
    // ...
});
```

**Key Points**:
- `name`: Identifies this remote (must match in host config)
- `exposes`: Components/modules exported for host consumption
- `shared`: Dependencies shared with host to avoid duplication

### Remote Configuration (Angular MFE)

**File**: `packages/checkout/angular.json` (Module Federation plugins configured via build)

Angular MFE exposes its bootstrap component for host consumption.

---

## Micro Frontends Overview

### 1. **Shell (Host Application)**

**Location**: `packages/shell`  
**Framework**: Next.js 14 (Pages Router)  
**Port**: 3000  
**Team**: Platform/Host Team

**Responsibilities**:
- Main container application
- Routing and page layout
- Global header and footer
- Navigation between MFEs
- Shared styling and theming

**Key Files**:
- `pages/_app.tsx` - App wrapper
- `pages/_document.tsx` - Document wrapper
- `pages/index.tsx` - Home route
- `pages/products.tsx` - Product route
- `pages/cart.tsx` - Cart route
- `pages/checkout.tsx` - Checkout route
- `pages/profile.tsx` - Profile route
- `pages/admin.tsx` - Admin route

**Module Federation Role**: **Host/Container**

---

### 2. **Home MFE**

**Location**: `packages/home`  
**Framework**: React 18 + Vite  
**Port**: 3001  
**Team**: Catalog Team

**Responsibilities**:
- Homepage with marketing content
- Featured products showcase
- Product categories display
- Promotional banners
- Hero section

**Key Components**:
- `Home.tsx` - Main home page component
- `HeroSection.tsx` - Banner section
- `Categories.tsx` - Category showcase
- `FeaturedProducts.tsx` - Featured items
- `PromoSection.tsx` - Promotional content

**State Management**: Zustand (if needed)  
**Module Federation Role**: **Remote**  
**Exposes**: `./Home` component

---

### 3. **Product MFE**

**Location**: `packages/product`  
**Framework**: React 18 + Vite  
**Port**: 3002  
**Team**: Catalog Team

**Responsibilities**:
- Product listing
- Product detail pages
- Product filtering and search
- Product reviews and ratings
- Product recommendations

**Key Components**:
- `ProductList.tsx` - List of products
- `ProductDetail.tsx` - Individual product page

**State Management**: Zustand (productStore)  
**Module Federation Role**: **Remote**  
**Exposes**: Product components

---

### 4. **Cart MFE**

**Location**: `packages/cart`  
**Framework**: React 18 + Vite (Vue.js mixed in)  
**Port**: 3003  
**Team**: Cart Team

**Responsibilities**:
- Shopping cart display
- Cart item management (add, remove, update quantity)
- Subtotal/tax/shipping calculations
- Cart widget for header

**Key Components**:
- `CartWidget.tsx` - Mini cart display
- `CartPage.vue` - Full cart page

**State Management**: Zustand (cartStore)  
**Module Federation Role**: **Remote**

---

### 5. **Checkout MFE**

**Location**: `packages/checkout`  
**Framework**: Angular 17  
**Port**: 3004  
**Team**: Payments/Order Team

**Responsibilities**:
- Checkout flow and forms
- Order summary
- Payment processing
- Shipping address selection
- Order confirmation

**Architecture**: Angular standalone components  
**State Management**: RxJS + Angular services  
**Module Federation Role**: **Remote**

---

### 6. **Profile MFE**

**Location**: `packages/profile`  
**Framework**: React 18 + Vite  
**Port**: 3005  
**Team**: User/Account Team

**Responsibilities**:
- User profile information
- Order history
- Saved addresses
- Payment methods
- Account settings

**Key Components**:
- `Profile.tsx` - Profile page
- `OrderHistory.tsx` - Order list

**State Management**: Zustand (userStore)  
**Module Federation Role**: **Remote**

---

### 7. **Admin MFE**

**Location**: `packages/admin`  
**Framework**: Next.js 14 (Pages Router)  
**Port**: 3006  
**Team**: Operations/Admin Team

**Responsibilities**:
- Admin dashboard
- Product management (CRUD)
- Order management
- User management
- Analytics and reporting

**Key Components**:
- `AdminDashboard.tsx` - Main admin interface

**State Management**: Zustand  
**Module Federation Role**: **Remote**

---

## Shared Package

**Location**: `packages/shared`  
**Package Name**: `@ecommerce/shared`

### Purpose
Provides common utilities, types, and communication infrastructure used across all MFEs.

### Contents

#### 1. **Type Definitions** (`src/types.ts`)

```typescript
// Product Types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    tags: string[];
    stock: number;
    rating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
}

// Cart Types
export interface CartItem {
    productId: string;
    product: Product;
    quantity: number;
    addedAt: string;
}

export interface Cart {
    id: string;
    userId?: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    updatedAt: string;
}

// User Types
export interface User {
    id: string;
    // ... user properties
}

// ... and more types
```

#### 2. **Event Bus** (`src/eventBus.ts`)

Custom pub/sub implementation for cross-MFE communication:

```typescript
export type EventCallback<T = unknown> = (data: T) => void;

class EventBus {
    private events: Map<string, Set<EventCallback>> = new Map();

    on<T = unknown>(event: string, callback: EventCallback<T>): () => void
    emit<T = unknown>(event: string, data?: T): void
    off(event: string, callback?: EventCallback): void
    clear(): void
}

export const eventBus = new EventBus();

export const EVENTS = {
    // Cart Events
    ADD_TO_CART: 'cart:add',
    REMOVE_FROM_CART: 'cart:remove',
    UPDATE_CART: 'cart:update',
    // ... more events
};
```

### Consumption

All MFEs import from `@ecommerce/shared`:

```typescript
import { eventBus, EVENTS, type Product, type Cart } from '@ecommerce/shared';
```

---

## Communication Patterns

### 1. **Event Bus (Primary Pattern)**

Used for publishing and subscribing to events across MFEs.

**Example: Cart MFE emits "ADD_TO_CART" event**

```typescript
// CartStore.ts in Cart MFE
import { eventBus, EVENTS } from '@ecommerce/shared';

export const addToCart = (product: Product, quantity: number) => {
    // Update local store
    const item = { product, quantity, productId: product.id, addedAt: new Date().toISOString() };
    cartStore.setState((state) => ({
        items: [...state.items, item],
    }));
    
    // Emit event for other MFEs
    eventBus.emit(EVENTS.ADD_TO_CART, { product, quantity });
};
```

**Example: Product MFE listens to cart events**

```typescript
// ProductComponent.tsx
useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.ADD_TO_CART, (data) => {
        console.log('Item added to cart:', data);
        // Update UI or analytics
    });
    
    return unsubscribe;
}, []);
```

### 2. **Shared State (Via Zustand)**

Each React MFE maintains its own Zustand store that can be imported by others:

```typescript
// productStore.ts
import create from 'zustand';

export const useProductStore = create((set) => ({
    products: [],
    selectedProduct: null,
    setProducts: (products) => set({ products }),
    setSelectedProduct: (product) => set({ selectedProduct: product }),
}));
```

**Consumption in another MFE**:

```typescript
import { useProductStore } from '@ecommerce/product';

export function HomePage() {
    const products = useProductStore((state) => state.products);
    // ...
}
```

### 3. **Direct Component Import (Via Module Federation)**

Components can be directly imported from remotes:

```typescript
// In shell pages/_app.tsx
import dynamic from 'next/dynamic';

const Home = dynamic(() => import('home/Home'), { loading: () => <div>Loading...</div> });
const Product = dynamic(() => import('product/Product'), { loading: () => <div>Loading...</div> });
```

---

## State Management

### React MFEs (Zustand)

Each React MFE has its own Zustand store:

- **Home MFE**: General app state (theme, locale, etc.)
- **Product MFE**: `productStore.ts` - Products, filters, selected product
- **Cart MFE**: `cartStore.ts` - Cart items, totals, checkout state
- **Profile MFE**: `userStore.ts` - User profile, orders, preferences
- **Admin MFE**: Admin state - Products, orders, users

**Pattern**:

```typescript
// store/cartStore.ts
import { create } from 'zustand';

interface CartStore {
    items: CartItem[];
    total: number;
    addItem: (item: CartItem) => void;
    removeItem: (productId: string) => void;
}

export const useCartStore = create<CartStore>((set) => ({
    items: [],
    total: 0,
    addItem: (item) => set((state) => ({
        items: [...state.items, item],
        total: state.total + item.product.price * item.quantity,
    })),
    removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.productId !== productId),
    })),
}));
```

### Angular MFE (RxJS)

Checkout MFE uses Angular services with RxJS for state management:

```typescript
// checkout.service.ts
@Injectable({ providedIn: 'root' })
export class CheckoutService {
    private orderState = new BehaviorSubject<Order | null>(null);
    public order$ = this.orderState.asObservable();
    
    updateOrder(order: Order) {
        this.orderState.next(order);
    }
}
```

---

## Build & Deployment

### Build Process

**Turborepo** orchestrates the build pipeline:

```json
{
    "tasks": {
        "build": {
            "dependsOn": ["^build"],
            "outputs": [".next/**", "!.next/cache/**", "dist/**"]
        }
    }
}
```

**Build Command**:
```bash
npm run build
```

This:
1. Builds the shared package
2. Builds all remote MFEs in parallel
3. Builds the shell host last

### Output Artifacts

- **Next.js MFEs** (Shell, Admin): `.next/` directory with remoteEntry.js
- **Vite MFEs** (Home, Product, Cart, Profile): `dist/` directory with remoteEntry.js
- **Angular MFE** (Checkout): `dist/` directory with remoteEntry.js

### Deployment Strategy

Each MFE can be deployed independently:

1. **Development**: All MFEs run locally on different ports
2. **Staging**: Deploy MFEs to staging CDN/servers
3. **Production**: Deploy MFEs to production CDN/servers

The host shell needs to be updated with correct remote URLs (via environment variables or config):

```javascript
// Runtime config replacement
const remotes = {
    home: process.env.REACT_APP_HOME_URL || 'http://localhost:3001/_next/static/chunks/remoteEntry.js',
    product: process.env.REACT_APP_PRODUCT_URL || 'http://localhost:3002/_next/static/chunks/remoteEntry.js',
    // ...
};
```

---

## Development Workflow

### Prerequisites

- Node.js 18+
- npm 10+

### Installation

```bash
# Install dependencies for all packages
npm install
```

### Starting Development

**Option 1: Start all MFEs**
```bash
npm run dev
```

This starts all MFEs in parallel:
- Shell: http://localhost:3000
- Home: http://localhost:3001
- Product: http://localhost:3002
- Cart: http://localhost:3003
- Checkout: http://localhost:3004
- Profile: http://localhost:3005
- Admin: http://localhost:3006

**Option 2: Start specific MFE**
```bash
npm run dev:shell
npm run dev:home
npm run dev:product
npm run dev:cart
npm run dev:checkout
npm run dev:profile
npm run dev:admin
```

### Building

```bash
# Build all packages
npm run build

# Alternatively, build specific package
npm run build -w @ecommerce/home
```

### Cleaning

```bash
# Remove dist/build artifacts and node_modules
npm run clean
```

---

## Ports & Services

| Service | Port | Framework | URL |
|---------|------|-----------|-----|
| Shell (Host) | 3000 | Next.js | http://localhost:3000 |
| Home MFE | 3001 | React + Vite | http://localhost:3001 |
| Product MFE | 3002 | React + Vite | http://localhost:3002 |
| Cart MFE | 3003 | React + Vite | http://localhost:3003 |
| Checkout MFE | 3004 | Angular | http://localhost:3004 |
| Profile MFE | 3005 | React + Vite | http://localhost:3005 |
| Admin MFE | 3006 | Next.js | http://localhost:3006 |

---

## Design Patterns

### 1. **Module Federation (Runtime Composition)**

Each MFE is independently built and deployed. The host loads them at runtime via remoteEntry.js files.

**Advantages**:
- Independent development and deployment
- Different tech stacks
- Scalable architecture
- Reduced bundle size (code splitting)

### 2. **Pub/Sub Event Bus (Async Communication)**

MFEs communicate asynchronously via custom event bus instead of direct function calls.

**Usage**:
```typescript
// MFE A (Cart)
eventBus.emit(EVENTS.ADD_TO_CART, { product, quantity });

// MFE B (Header)
eventBus.on(EVENTS.ADD_TO_CART, ({ product, quantity }) => {
    // Update cart badge
});
```

### 3. **Shared Package Pattern**

Common types, utilities, and constants centralized in `@ecommerce/shared`.

**Benefits**:
- Single source of truth for types
- Consistency across MFEs
- Easy updates to shared code

### 4. **Store-Based State (Zustand)**

Each React MFE manages its own state with Zustand stores that can be imported by others.

**Pattern**:
```typescript
// Exported from each React MFE
export const useProductStore = create(/* store definition */);
```

### 5. **Lazy Loading & Code Splitting**

Shell uses `next/dynamic` for lazy loading remote components:

```typescript
const Home = dynamic(() => import('home/Home'), {
    loading: () => <Skeleton />,
    ssr: false,
});
```

---

## Dependencies & Sharing

### Shared Dependencies (Singleton Pattern)

To avoid duplicate libraries at runtime, shared libraries are configured with singleton pattern:

```javascript
// In Module Federation config
shared: {
    react: {
        singleton: true,
        requiredVersion: false,
        eager: true,
    },
    'react-dom': {
        singleton: true,
        requiredVersion: false,
        eager: true,
    },
}
```

**Benefits**:
- Reduced bundle size
- Shared state works correctly
- Only one React instance in DOM

### External Dependencies

Each MFE specifies its own dependencies:

- **React MFEs**: React, React-DOM, Zustand, TypeScript
- **Angular MFE**: @angular/core, RxJS
- **Shared**: TypeScript types only

### Transpilation

The host (shell) transpiles the shared package:

```javascript
// packages/shell/next.config.js
transpilePackages: ['@ecommerce/shared'],
```

---

## Challenges & Considerations

### 1. **Version Conflicts**
- Different MFEs may use different versions of dependencies
- Solution: Use singleton pattern for critical deps (React, React-DOM)

### 2. **State Consistency**
- Multiple MFEs may try to update the same data
- Solution: Use event bus and centralized store patterns

### 3. **Build Complexity**
- Multiple build tools (Webpack, Vite, Angular CLI)
- Solution: Turborepo orchestrates builds, each MFE configured independently

### 4. **Testing**
- Integration tests need to consider cross-MFE interactions
- Solution: Test event bus, store integration separately

### 5. **Debugging**
- Multiple dev servers running
- Solution: Browser devtools, console logs, error boundaries

---

## Future Improvements & Roadmap

1. **Shared UI Component Library**
   - Extract common UI components into shared package
   - Reduce code duplication across MFEs

2. **Performance Monitoring**
   - Add analytics for MFE load times
   - Web Vitals tracking

3. **E2E Testing**
   - Cypress/Playwright tests for cross-MFE flows
   - Integration testing suite

4. **Error Tracking**
   - Centralized error logging (Sentry, etc.)
   - Error boundary implementation

5. **Analytics**
   - User event tracking
   - Component-level performance metrics

6. **PWA Support**
   - Service Worker implementation
   - Offline capabilities

7. **Type Safety**
   - Shared TypeScript configuration across MFEs
   - Monorepo-wide type checking

---

## Resources & References

- [Module Federation Official Docs](https://webpack.js.org/concepts/module-federation/)
- [Turborepo Documentation](https://turbo.build/)
- [Next.js Module Federation](https://nextjs.org/docs/app/building-your-application/performance/measuring-performance)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)

---

## Summary

This e-commerce microfrontend platform demonstrates a modern approach to building scalable, polyglot applications using Module Federation. Each team can independently develop, test, and deploy their MFE while maintaining architectural consistency through shared types, event-based communication, and a unified host shell. The use of Turborepo provides a smooth development experience across the monorepo, while Zustand and RxJS offer flexible state management solutions suited to each framework choice.
