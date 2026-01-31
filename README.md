# E-commerce Microfrontend Platform

A polyglot microfrontend e-commerce platform using **Module Federation** with Next.js, React, Angular, and Vue.js.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Shell (Next.js - Port 3000)                 │
│                        Host Application                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────┐ │
│  │  Home   │  │ Product │  │  Cart   │  │Checkout │  │Profile│ │
│  │ (React) │  │ (React) │  │ (React) │  │(Angular)│  │(React)│ │
│  │  :3001  │  │  :3002  │  │  :3003  │  │  :3004  │  │ :3005 │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └───────┘ │
│                              ┌─────────┐                        │
│                              │  Admin  │                        │
│                              │(Next.js)│                        │
│                              │  :3006  │                        │
│                              └─────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## 👥 Team Ownership

| Team | Microfrontend | Framework | Port | State Management |
|------|--------------|-----------|------|------------------|
| **Host** | Shell | Next.js 14 (Pages Router) | 3000 | Context + Event Bus |
| **Catalog** | Home | React + Vite | 3001 | Zustand |
| **Catalog** | Product | React + Vite | 3002 | Zustand |
| **Cart** | Cart | React + Vite | 3003 | Zustand |
| **Order** | Checkout | Angular 17 | 3004 | Standalone Components |
| **User** | Profile | React + Vite | 3005 | Zustand |
| **Ops** | Admin | Next.js 14 (Pages Router) | 3006 | Zustand |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 10+

### Installation

```bash
# Clone and install dependencies
cd E-commerce
npm install
```

### Development

Start all microfrontends:
```bash
npm run dev
```

Or start individual MFEs:
```bash
npm run dev:shell     # Port 3000 - Host application
npm run dev:home      # Port 3001 - Home page
npm run dev:product   # Port 3002 - Product listing
npm run dev:cart      # Port 3003 - Shopping cart
npm run dev:checkout  # Port 3004 - Checkout flow
npm run dev:profile   # Port 3005 - User profile
npm run dev:admin     # Port 3006 - Admin dashboard
```

### Build

```bash
npm run build
```

## 📁 Project Structure

```
E-commerce/
├── packages/
│   ├── shell/          # Host application (Next.js)
│   ├── home/           # Home page (React + Vite)
│   ├── product/        # Product listing & detail (React + Vite)
│   ├── cart/           # Shopping cart (React + Vite)
│   ├── checkout/       # Checkout flow (Angular 17)
│   ├── profile/        # User profile (React + Vite)
│   ├── admin/          # Admin dashboard (Next.js)
│   └── shared/         # Shared utilities & types
├── package.json        # Root workspace config
├── turbo.json          # Turborepo config
└── README.md
```

## 🔧 Cross-MFE Communication

The platform uses a custom Event Bus for communication between microfrontends:

```typescript
import { eventBus, EVENTS } from '@ecommerce/shared';

// Emit an event
eventBus.emit(EVENTS.ADD_TO_CART, { productId: '123', quantity: 1 });

// Listen to events
eventBus.on(EVENTS.CART_UPDATED, (data) => {
  console.log('Cart updated:', data);
});
```

### Available Events
- `cart:add` / `cart:remove` / `cart:update` / `cart:clear`
- `user:login` / `user:logout`
- `product:selected` / `product:viewed`
- `order:created` / `checkout:completed`
- `navigation:navigate`

## 🎨 Design System

All microfrontends share a consistent dark theme with:
- Modern glassmorphism effects
- Gradient accents (indigo to purple)
- Smooth micro-animations
- Responsive design

## 📦 Independent Deployment

Each team can deploy their MFE independently:

1. Build the MFE: `cd packages/<mfe> && npm run build`
2. Deploy the dist folder to your CDN/server
3. Update the remote URL in shell's `next.config.js`

## 🧪 Verification

Test that all MFEs are running:
```bash
curl http://localhost:3000  # Shell
curl http://localhost:3001  # Home
curl http://localhost:3002  # Product
curl http://localhost:3003  # Cart
curl http://localhost:3004  # Checkout
curl http://localhost:3005  # Profile
curl http://localhost:3006  # Admin
```

## 📝 License

MIT
