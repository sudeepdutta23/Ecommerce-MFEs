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
  /** Primary product photo; consumers fall back to a placeholder when absent. */
  imageUrl?: string;
  /** Gallery photos (angles/lifestyle shots) for the overview page, primary first. */
  images?: string[];
  /** Marketing bullet points shown on the overview page. */
  highlights?: string[];
  /** Key/value specification rows shown on the overview page. */
  specs?: Record<string, string>;
}

/** A line in the shared cart (persisted via @ecom/utils cart-storage). */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  /** Strike-through list price, when discounted — enables savings math. */
  mrp?: number;
  currency: string;
  quantity: number;
  imageUrl?: string;
}

export type OrderStatus = 'processing' | 'shipped' | 'delivered';

/** A placed order (persisted via @ecom/utils order-storage). */
export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  savings: number;
  currency: string;
  /** Epoch ms when the order was placed. */
  placedAt: number;
  status: OrderStatus;
}

export interface TrackedEvent {
  id: string;
  name: string;
  source: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}
