import { type RemoteDefinition } from '@ecom/types';

/**
 * The remote registry — the ONLY place the shell knows about remotes.
 *
 * To plug in a new MFE:
 *   1. Add a REMOTE_<NAME>_URL entry to .env (and your deploy environments).
 *   2. Add one RemoteDefinition below.
 * Navigation and routing are generated from this array; nothing else changes.
 * To remove an MFE, delete its entry.
 */
export const remotes: RemoteDefinition[] = [
  {
    scope: 'authDashboard',
    url: process.env.REMOTE_AUTH_DASHBOARD_URL ?? 'http://localhost:3001/remoteEntry.js',
    module: './App',
    routePath: 'account',
    displayName: 'Account',
  },
  {
    scope: 'productCatalog',
    url: process.env.REMOTE_PRODUCT_CATALOG_URL ?? 'http://localhost:3002/remoteEntry.js',
    module: './App',
    routePath: 'catalog',
    displayName: 'Catalog',
  },
  {
    scope: 'analytics',
    url: process.env.REMOTE_ANALYTICS_URL ?? 'http://localhost:3003/remoteEntry.js',
    module: './App',
    routePath: 'analytics',
    displayName: 'Analytics',
  },
  {
    scope: 'cart',
    url: process.env.REMOTE_CART_URL ?? 'http://localhost:3004/remoteEntry.js',
    module: './App',
    routePath: 'cart',
    displayName: 'Cart',
  },
  {
    scope: 'orders',
    url: process.env.REMOTE_ORDERS_URL ?? 'http://localhost:3005/remoteEntry.js',
    module: './App',
    routePath: 'orders',
    displayName: 'Orders',
  },
  {
    scope: 'admin',
    url: process.env.REMOTE_ADMIN_URL ?? 'http://localhost:3006/remoteEntry.js',
    module: './App',
    routePath: 'admin',
    displayName: 'Admin',
    // The admin console is a separate platform: it renders without the
    // storefront chrome and brings its own full-page layout.
    standalone: true,
  },
];
