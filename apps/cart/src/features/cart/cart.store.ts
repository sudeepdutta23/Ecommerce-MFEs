import { makeAutoObservable, runInAction } from 'mobx';
import { type CartItem } from '@ecom/types';
import { addOrder, eventBus, getCartCount, getCartItems, saveCartItems } from '@ecom/utils';

/**
 * MobX store PRIVATE to the cart MFE.
 *
 * The cart itself is persisted via the shared cart-storage contract
 * (@ecom/utils): the catalog appends items, this store owns quantities,
 * removal, and checkout. Every mutation is persisted and broadcast as
 * `cart:changed` so the shell badge (and anyone else) stays in sync.
 */
export class CartStore {
  items: CartItem[] = getCartItems();
  checkoutState: 'idle' | 'placing' | 'placed' = 'idle';

  private disposeListener: () => void;

  constructor() {
    makeAutoObservable(this);
    // Re-read storage when another MFE mutates the cart while we're mounted
    // (e.g. adds from the catalog). Our own emissions make this a no-op.
    this.disposeListener = eventBus.on('cart:changed', () => {
      runInAction(() => {
        this.items = getCartItems();
      });
    });
  }

  dispose(): void {
    this.disposeListener();
  }

  get totalQuantity(): number {
    return getCartCount(this.items);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /** Sum of list prices, for the savings line. Falls back to price when no MRP. */
  get totalMrp(): number {
    return this.items.reduce((sum, item) => sum + (item.mrp ?? item.price) * item.quantity, 0);
  }

  get savings(): number {
    return this.totalMrp - this.subtotal;
  }

  get currency(): string {
    return this.items[0]?.currency ?? 'INR';
  }

  setQuantity(productId: string, quantity: number): void {
    const item = this.items.find((line) => line.productId === productId);
    if (!item) return;
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    item.quantity = quantity;
    this.commit('cart_quantity_changed', { productId, quantity });
  }

  increment(productId: string): void {
    const item = this.items.find((line) => line.productId === productId);
    if (item) this.setQuantity(productId, item.quantity + 1);
  }

  decrement(productId: string): void {
    const item = this.items.find((line) => line.productId === productId);
    if (item) this.setQuantity(productId, item.quantity - 1);
  }

  remove(productId: string): void {
    this.items = this.items.filter((line) => line.productId !== productId);
    this.commit('cart_item_removed', { productId });
  }

  clear(): void {
    this.items = [];
    this.commit('cart_cleared');
  }

  /** Demo checkout: replace with a real order API call via createApiClient. */
  async placeOrder(): Promise<void> {
    if (this.items.length === 0 || this.checkoutState === 'placing') return;
    this.checkoutState = 'placing';
    eventBus.emit('analytics:track', {
      name: 'checkout_started',
      source: 'cart',
      payload: { items: this.totalQuantity, subtotal: this.subtotal },
    });
    await new Promise((resolve) => setTimeout(resolve, 800));
    const order = addOrder({
      items: this.items.slice(),
      subtotal: this.subtotal,
      savings: this.savings,
      currency: this.currency,
    });
    runInAction(() => {
      this.items = [];
      saveCartItems([]);
      this.checkoutState = 'placed';
    });
    eventBus.emit('cart:changed', { count: 0 });
    eventBus.emit('order:placed', {
      orderId: order.id,
      total: order.subtotal,
      currency: order.currency,
    });
    eventBus.emit('analytics:track', {
      name: 'order_placed',
      source: 'cart',
      payload: { orderId: order.id, total: order.subtotal },
    });
  }

  startNewOrder(): void {
    this.checkoutState = 'idle';
  }

  /** Persist + broadcast after a mutation, and log it to analytics. */
  private commit(eventName: string, payload?: Record<string, unknown>): void {
    saveCartItems(this.items);
    eventBus.emit('cart:changed', { count: this.totalQuantity });
    eventBus.emit('analytics:track', { name: eventName, source: 'cart', payload });
  }
}
