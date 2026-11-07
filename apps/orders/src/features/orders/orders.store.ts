import { makeAutoObservable, runInAction } from 'mobx';
import {
  apiErrorMessage,
  checkoutApi,
  eventBus,
  getAuthToken,
  ordersApi,
  type OrderDetail,
  type OrderSummary,
} from '@ecom/utils';

const PAGE_SIZE = 10;

/**
 * MobX store PRIVATE to the orders MFE. Orders live on the backend; a checkout
 * elsewhere (`order:placed`) triggers a re-read while we're mounted.
 */
export class OrdersStore {
  orders: OrderSummary[] = [];
  total = 0;
  totalPages = 1;
  /** Zero-based, like the API. */
  page = 0;
  loading = false;
  error = '';

  order: OrderDetail | null = null;
  orderLoading = false;
  busy = false;

  private disposeListeners: Array<() => void>;

  constructor() {
    makeAutoObservable(this);
    this.disposeListeners = [eventBus.on('order:placed', () => void this.load())];
  }

  dispose(): void {
    for (const dispose of this.disposeListeners) dispose();
  }

  get signedIn(): boolean {
    return getAuthToken() !== null;
  }

  async load(page = this.page): Promise<void> {
    if (!this.signedIn) return;
    this.loading = true;
    this.error = '';
    try {
      const result = await ordersApi.list({ page, size: PAGE_SIZE });
      runInAction(() => {
        this.orders = result.content;
        this.total = result.totalElements;
        this.totalPages = Math.max(1, result.totalPages);
        this.page = result.page;
      });
    } catch (error) {
      runInAction(() => {
        this.error = apiErrorMessage(error, 'Could not load your orders.');
      });
    }
    runInAction(() => {
      this.loading = false;
    });
  }

  async loadOrder(id: string): Promise<void> {
    this.orderLoading = true;
    this.order = null;
    this.error = '';
    try {
      const order = await ordersApi.get(id);
      runInAction(() => {
        this.order = order;
      });
    } catch (error) {
      runInAction(() => {
        this.error = apiErrorMessage(error, 'Could not load this order.');
      });
    }
    runInAction(() => {
      this.orderLoading = false;
    });
  }

  async cancel(id: string, reason: string): Promise<void> {
    await this.act('Could not cancel this order.', async () => {
      const order = await ordersApi.cancel(id, reason || undefined);
      runInAction(() => {
        this.order = order;
      });
    });
  }

  /** Pays the whole checkout: one payment can cover orders from several sellers. */
  async pay(checkoutId: string, orderId: string, paymentToken: string): Promise<void> {
    await this.act('The payment did not go through.', async () => {
      await checkoutApi.pay(checkoutId, paymentToken);
      await this.loadOrder(orderId);
    });
  }

  private async act(fallback: string, call: () => Promise<void>): Promise<void> {
    this.busy = true;
    this.error = '';
    try {
      await call();
    } catch (error) {
      runInAction(() => {
        this.error = apiErrorMessage(error, fallback);
      });
    }
    runInAction(() => {
      this.busy = false;
    });
  }
}
