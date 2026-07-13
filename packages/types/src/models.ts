/** Domain models shared across MFE boundaries. Keep these small and stable. */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Strike-through list price; when set, cards show the discount and savings. */
  mrp?: number;
  currency: string;
  category: string;
  rating: number;
  inStock: boolean;
}

export interface TrackedEvent {
  id: string;
  name: string;
  source: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}
