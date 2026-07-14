import { type CartItem, type Order } from '@ecom/types';

/**
 * Shared order persistence — same contract style as cart-storage: the cart
 * MFE appends an order at checkout, the orders MFE reads and displays them,
 * and the `order:placed` event broadcasts the transition.
 */

const ORDERS_KEY = 'ecom.orders';

export function getOrders(): Order[] {
  const raw = localStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(ORDERS_KEY);
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

/** Persist a new order (newest first) from the current cart. Returns it. */
export function addOrder(input: {
  items: CartItem[];
  subtotal: number;
  savings: number;
  currency: string;
}): Order {
  const order: Order = {
    id: `ORD-${Date.now().toString(36).toUpperCase()}`,
    items: input.items,
    subtotal: input.subtotal,
    savings: input.savings,
    currency: input.currency,
    placedAt: Date.now(),
    status: 'processing',
  };
  saveOrders([order, ...getOrders()]);
  return order;
}
