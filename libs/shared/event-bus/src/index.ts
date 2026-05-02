/**
 * @ecom/event-bus — Cross-MFE Communication Layer
 *
 * Provides a type-safe event bus built on browser CustomEvents.
 * All microfrontends use this instead of direct imports to stay decoupled.
 */

// ─── Event Type Map ───────────────────────────────────────────
export interface EcomEventMap {
  'ecom:cart:add': { product: { id: string; name: string; price: number; image: string; brand: string } }
  'ecom:cart:updated': { count: number }
  'ecom:cart:remove': { productId: string }
  'ecom:cart:clear': undefined
  'ecom:checkout:start': { items: Array<{ id: string; quantity: number }> }
  'ecom:checkout:complete': { orderNumber: string }
  'ecom:navigation:change': { path: string }
}

export type EcomEventName = keyof EcomEventMap

// ─── Emit ─────────────────────────────────────────────────────
export function emit<K extends EcomEventName>(
  name: K,
  ...args: EcomEventMap[K] extends undefined ? [] : [EcomEventMap[K]]
): void {
  const detail = args[0]
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

// ─── Subscribe ────────────────────────────────────────────────
export function on<K extends EcomEventName>(
  name: K,
  handler: (detail: EcomEventMap[K]) => void
): () => void {
  const listener = (e: Event) => {
    handler((e as CustomEvent).detail as EcomEventMap[K])
  }
  window.addEventListener(name, listener)
  return () => window.removeEventListener(name, listener)
}

// ─── One-time listener ────────────────────────────────────────
export function once<K extends EcomEventName>(
  name: K,
  handler: (detail: EcomEventMap[K]) => void
): () => void {
  const unsub = on(name, (detail) => {
    unsub()
    handler(detail)
  })
  return unsub
}
