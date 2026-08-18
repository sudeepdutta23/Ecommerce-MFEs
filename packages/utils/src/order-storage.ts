import { type CartItem, type Order, type OrderStatus } from '@ecom/types';

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

/** Fulfillment pipeline, in order. Statuses only ever move forward. */
export const ORDER_STATUS_FLOW: readonly OrderStatus[] = ['processing', 'shipped', 'delivered'];

export function orderStatusRank(status: OrderStatus): number {
  return ORDER_STATUS_FLOW.indexOf(status);
}

/**
 * Status shown to users. The demo lifecycle derives progression from order
 * age (so timelines visibly advance without a backend), but an explicitly
 * persisted status — e.g. an admin marking an order shipped — always wins
 * when it is further along. Every MFE must render THIS, not `order.status`,
 * so customer and ops views agree.
 */
export function effectiveOrderStatus(order: Order): OrderStatus {
  const ageMinutes = (Date.now() - order.placedAt) / 60_000;
  const derived: OrderStatus = ageMinutes < 2 ? 'processing' : ageMinutes < 10 ? 'shipped' : 'delivered';
  return orderStatusRank(order.status) > orderStatusRank(derived) ? order.status : derived;
}

/** Persist a new status for one order. Returns the updated order, or null if not found. */
export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const orders = getOrders();
  const order = orders.find((entry) => entry.id === orderId);
  if (!order) return null;
  order.status = status;
  saveOrders(orders);
  return order;
}
