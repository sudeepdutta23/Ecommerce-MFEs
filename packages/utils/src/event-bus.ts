import { type MfeEventMap } from '@ecom/types';

/**
 * Contract-based event bus for cross-MFE communication.
 *
 * Built on window CustomEvents so it works across independently-bundled
 * federated modules without any shared store. Payloads are typed against
 * MfeEventMap from @ecom/types — the compiler enforces the contract on
 * both the emitting and the listening side.
 */

const EVENT_PREFIX = 'ecom-mfe:';

type EmitArgs<K extends keyof MfeEventMap> = MfeEventMap[K] extends undefined
  ? [type: K]
  : [type: K, payload: MfeEventMap[K]];

export const eventBus = {
  emit<K extends keyof MfeEventMap>(...[type, payload]: EmitArgs<K>): void {
    window.dispatchEvent(new CustomEvent(EVENT_PREFIX + type, { detail: payload }));
  },

  /** Subscribe to an event. Returns an unsubscribe function. */
  on<K extends keyof MfeEventMap>(type: K, handler: (payload: MfeEventMap[K]) => void): () => void {
    const listener = (event: Event) => {
      handler((event as CustomEvent<MfeEventMap[K]>).detail);
    };
    window.addEventListener(EVENT_PREFIX + type, listener);
    return () => window.removeEventListener(EVENT_PREFIX + type, listener);
  },

  /** Subscribe to an event once; auto-unsubscribes after the first emission. */
  once<K extends keyof MfeEventMap>(
    type: K,
    handler: (payload: MfeEventMap[K]) => void,
  ): () => void {
    const off = this.on(type, (payload) => {
      off();
      handler(payload);
    });
    return off;
  },
};
