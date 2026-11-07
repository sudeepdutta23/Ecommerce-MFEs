/** Domain models shared across MFE boundaries. Keep these small and stable. */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  /** Role codes from the backend, e.g. CUSTOMER, ADMIN. */
  roles?: string[];
  /** Permission codes from the backend, e.g. user:read. Controls hide what these do not allow. */
  permissions?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Strike-through list price; when set, cards show the discount and savings. */
  mrp?: number;
  currency: string;
  /** Category display name; empty when the product has none. */
  category: string;
  categorySlug?: string;
  sellerName?: string;
  /** The backend has no ratings yet; the UI hides them when absent. */
  rating?: number;
  inStock: boolean;
  /** Primary product photo; consumers fall back to a placeholder when absent. */
  imageUrl?: string;
  /** Gallery photos (angles/lifestyle shots) for the overview page, primary first. */
  images?: string[];
  /** Marketing bullet points shown on the overview page. */
  highlights?: string[];
  /** Key/value specification rows shown on the overview page. */
  specs?: Record<string, string>;
}

/** A line in the shared cart (a guest's own, or a copy of the signed-in customer's server cart). */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  /** Strike-through list price, when discounted. The backend has none yet. */
  mrp?: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
  sellerName?: string;
  /** Why this line cannot be bought right now. */
  problem?: 'NOT_ON_SALE' | 'NOT_ENOUGH_STOCK' | null;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface TrackedEvent {
  id: string;
  name: string;
  source: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}
