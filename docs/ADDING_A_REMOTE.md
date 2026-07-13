# Adding a new remote (plug-and-play)

Worked example: an **orders** MFE at `/orders`, dev port `3004`.

## 1. Scaffold the app

Copy the closest existing remote and rename:

```bash
cp -r apps/analytics apps/orders
```

In `apps/orders/package.json`:

```json
{ "name": "@ecom/orders", "description": "Order history remote." }
```

In `apps/orders/webpack.config.js` — the container `name` must be a valid JS identifier and globally unique:

```js
const createMfeConfig = require('@ecom/config/webpack/create-mfe-config');

module.exports = createMfeConfig({
  name: 'orders',
  appDir: __dirname,
  port: 3004,
  exposes: {
    './App': './src/App',
    './mount': './src/mount',
  },
});
```

Pick any state library you like — state is private to the MFE, so this choice affects nobody else.

## 2. Build the feature

Keep the contract of every remote:

- `src/App.tsx` — default-exports a component containing **relative** `<Routes>`. No `BrowserRouter` here (the shell provides routing context; `bootstrap.tsx` provides it standalone).
- `src/mount.tsx` — framework-agnostic `mount(element, options)` for non-federated hosts.
- `src/bootstrap.tsx` — standalone dev entry; `src/index.ts` stays the two-line async boundary.
- Consume `@ecom/ui` for primitives, `@ecom/utils`/`@ecom/types` for contracts. Never import from another app.

Run it in isolation immediately:

```bash
pnpm install                      # link the new workspace package
pnpm --filter @ecom/orders dev    # http://localhost:3004
```

## 3. Register it in the shell

`apps/shell/src/remotes/remotes.config.ts` — add one entry:

```ts
{
  scope: 'orders',                       // = webpack name
  url: process.env.REMOTE_ORDERS_URL ?? 'http://localhost:3004/remoteEntry.js',
  module: './App',
  routePath: 'orders',
  displayName: 'Orders',
},
```

`apps/shell/.env` (and `.env.example` + your deploy environments):

```
REMOTE_ORDERS_URL=http://localhost:3004/remoteEntry.js
```

Done. The shell generates the nav link, the `/orders/*` route, the loading fallback, and the error boundary from the registry entry. No other shell code changes.

## 4. If the new MFE needs to talk to others

Add the event to the contract first — `packages/types/src/events.ts`:

```ts
'order:placed': { orderId: string; total: number; currency: string };
```

Then emit/subscribe through `eventBus` from `@ecom/utils`. Both sides compile against the same type; neither imports the other.

## 5. Deploy

Build and host `apps/orders/dist/` anywhere static (CORS enabled for the shell's origin), then point `REMOTE_ORDERS_URL` at its `remoteEntry.js` in each environment.

## Removing a remote

Delete its entry from `remotes.config.ts` (and the env var). The app folder can be archived or deleted independently.
