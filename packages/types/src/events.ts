import { type SessionUser } from './models';

/**
 * The cross-MFE event contract.
 *
 * This map is the ONLY sanctioned way MFEs communicate at runtime (besides
 * props and URL params). Adding an event here is an explicit, reviewed API
 * change — never share stores or import another MFE's modules directly.
 */
export interface MfeEventMap {
  'auth:login': { user: SessionUser };
  'auth:logout': undefined;
  'cart:item-added': { productId: string; name: string; price: number; currency: string };
  'analytics:track': { name: string; source: string; payload?: Record<string, unknown> };
}

export type MfeEventName = keyof MfeEventMap;
