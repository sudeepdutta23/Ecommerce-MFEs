import { makeAutoObservable, runInAction } from 'mobx';
import { type Order, type OrderStatus } from '@ecom/types';
import { eventBus, getOrders } from '@ecom/utils';

/**
 * MobX store PRIVATE to the orders MFE.
 *
 * Orders are read from the shared order-storage contract (@ecom/utils);
 * the cart MFE appends one at checkout and broadcasts `order:placed`, which
 * we listen to so a checkout that happens while we're mounted shows up live.
 */
export class OrdersStore {
  orders: Order[] = getOrders();

  private disposeListener: () => void;

  constructor() {
    makeAutoObservable(this);
    this.disposeListener = eventBus.on('order:placed', () => {
      runInAction(() => {
        this.orders = getOrders();
      });
    });
  }

  dispose(): void {
    this.disposeListener();
  }

  get totalSpent(): number {
    return this.orders.reduce((sum, order) => sum + order.subtotal, 0);
  }

  get currency(): string {
    return this.orders[0]?.currency ?? 'INR';
  }
}

/**
 * Demo delivery lifecycle: derive the displayed status from order age so the
 * timeline visibly progresses without a backend.
 */
export function deriveStatus(order: Order): OrderStatus {
  const ageMinutes = (Date.now() - order.placedAt) / 60_000;
  if (ageMinutes < 2) return 'processing';
  if (ageMinutes < 10) return 'shipped';
  return 'delivered';
}
