import { type CartItem } from '@ecom/types';

/**
 * Shared cart persistence.
 *
 * Like the auth session, localStorage is the shared persistence layer so any
 * MFE (and the shell) can read the cart without talking to another MFE:
 * the catalog appends items, the cart MFE owns quantities and checkout, and
 * the shell reads the count for its badge. Mutations are broadcast separately
 * via the `cart:changed` event on the bus.
 */

const CART_KEY = 'ecom.cart.items';

export function getCartItems(): CartItem[] {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(CART_KEY);
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

/** Total unit count across all lines (what the shell badge shows). */
export function getCartCount(items: CartItem[] = getCartItems()): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Add one unit of a product, merging into an existing line. Returns the new cart. */
export function addCartItem(item: Omit<CartItem, 'quantity'>): CartItem[] {
  const items = getCartItems();
  const existing = items.find((line) => line.productId === item.productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({ ...item, quantity: 1 });
  }
  saveCartItems(items);
  return items;
}
