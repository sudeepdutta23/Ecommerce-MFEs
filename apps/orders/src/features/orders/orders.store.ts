import { makeAutoObservable, runInAction } from 'mobx';
import { type Order, type OrderStatus } from '@ecom/types';
import { effectiveOrderStatus, eventBus, getOrders } from '@ecom/utils';

/**
 * MobX store PRIVATE to the orders MFE.
 *
 * Orders are read from the shared order-storage contract (@ecom/utils);
 * the cart MFE appends one at checkout (`order:placed`) and the admin MFE
 * advances fulfillment (`order:updated`) — both broadcasts trigger a
 * re-read so changes show up live while we're mounted.
 */
export class OrdersStore {
  orders: Order[] = getOrders();

  private disposeListeners: Array<() => void>;

  constructor() {
    makeAutoObservable(this);
    const reload = () => {
      runInAction(() => {
        this.orders = getOrders();
      });
    };
    this.disposeListeners = [eventBus.on('order:placed', reload), eventBus.on('order:updated', reload)];
  }

  dispose(): void {
    for (const dispose of this.disposeListeners) dispose();
  }

  get totalSpent(): number {
    return this.orders.reduce((sum, order) => sum + order.subtotal, 0);
  }

  get currency(): string {
    return this.orders[0]?.currency ?? 'INR';
  }
}

/**
 * Displayed status: the shared demo lifecycle (age-derived, overridable by
 * an explicitly persisted status from the admin console) — see
 * effectiveOrderStatus in @ecom/utils for the rules.
 */
export function deriveStatus(order: Order): OrderStatus {
  return effectiveOrderStatus(order);
}
