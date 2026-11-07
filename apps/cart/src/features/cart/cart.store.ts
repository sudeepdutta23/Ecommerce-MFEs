import { makeAutoObservable, runInAction } from 'mobx';
import { type CartItem } from '@ecom/types';
import {
  apiErrorCode,
  apiErrorMessage,
  cartApi,
  checkoutApi,
  eventBus,
  getAuthToken,
  getCartCount,
  getCartItems,
  mirrorServerCart,
  profileApi,
  saveCartItems,
  type Address,
  type AddressInput,
  type Checkout,
  type ServerCart,
} from '@ecom/utils';

export type CheckoutStep = 'cart' | 'address' | 'payment' | 'placed';

/** The simulator approves any token but this one. A real provider's SDK would produce the token. */
export const DECLINING_TOKEN = 'tok_decline';

/**
 * MobX store PRIVATE to the cart MFE.
 *
 * A signed-in customer's cart lives on the backend (GET/PUT/DELETE /cart): prices, stock problems and
 * the total are the server's answer, never computed here. A guest's stays in cart-storage and moves to
 * the account at sign-in. Every change is broadcast as `cart:changed` so the shell badge stays in sync.
 */
export class CartStore {
  items: CartItem[] = getCartItems();
  serverTotal: number | null = null;
  serverCurrency: string | null = null;
  readyForCheckout = false;
  loading = false;
  error = '';

  step: CheckoutStep = 'cart';
  addresses: Address[] = [];
  selectedAddressId = '';
  checkout: Checkout | null = null;
  busy = false;

  /** One purchase, one key: a retry after a lost response returns the same checkout, not a second one. */
  private idempotencyKey = crypto.randomUUID();
  private disposeListener: () => void;

  constructor() {
    makeAutoObservable(this);
    // Re-read when another MFE changes the cart while we're mounted (e.g. adds from the catalog).
    this.disposeListener = eventBus.on('cart:changed', () => {
      runInAction(() => {
        this.items = getCartItems();
      });
    });
    void this.load();
  }

  dispose(): void {
    this.disposeListener();
  }

  get signedIn(): boolean {
    return getAuthToken() !== null;
  }

  get totalQuantity(): number {
    return getCartCount(this.items);
  }

  /** The server's total when signed in: lines with a problem do not count towards it. */
  get subtotal(): number {
    return this.serverTotal ?? this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get currency(): string {
    return this.serverCurrency ?? this.items[0]?.currency ?? 'EUR';
  }

  private apply(cart: ServerCart): void {
    this.items = mirrorServerCart(cart);
    this.serverTotal = cart.total;
    this.serverCurrency = cart.currency;
    this.readyForCheckout = cart.readyForCheckout;
  }

  async load(): Promise<void> {
    if (!this.signedIn) return;
    this.loading = true;
    await this.run('Could not load your cart.', async () => {
      const cart = await cartApi.get();
      runInAction(() => this.apply(cart));
    });
    runInAction(() => {
      this.loading = false;
    });
  }

  /** Runs a call, turning a failure into the message the page shows. */
  private async run(fallback: string, call: () => Promise<void>): Promise<boolean> {
    this.error = '';
    try {
      await call();
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = apiErrorMessage(error, fallback);
      });
      return false;
    }
  }

  async setQuantity(productId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.remove(productId);
      return;
    }
    if (!this.signedIn) {
      this.updateGuest(this.items.map((line) => (line.productId === productId ? { ...line, quantity } : line)));
      return;
    }
    const done = await this.run('Could not change the quantity.', async () => {
      const cart = await cartApi.setQuantity(productId, quantity);
      runInAction(() => this.apply(cart));
    });
    if (done) this.track('cart_quantity_changed', { productId, quantity });
  }

  increment(productId: string): void {
    const item = this.items.find((line) => line.productId === productId);
    if (item) void this.setQuantity(productId, item.quantity + 1);
  }

  decrement(productId: string): void {
    const item = this.items.find((line) => line.productId === productId);
    if (item) void this.setQuantity(productId, item.quantity - 1);
  }

  async remove(productId: string): Promise<void> {
    if (!this.signedIn) {
      this.updateGuest(this.items.filter((line) => line.productId !== productId));
      return;
    }
    const done = await this.run('Could not remove this line.', async () => {
      const cart = await cartApi.remove(productId);
      runInAction(() => this.apply(cart));
    });
    if (done) this.track('cart_item_removed', { productId });
  }

  async clear(): Promise<void> {
    if (!this.signedIn) {
      this.updateGuest([]);
      return;
    }
    const done = await this.run('Could not clear your cart.', async () => {
      await cartApi.clear();
      runInAction(() => {
        this.items = [];
        this.serverTotal = 0;
        this.readyForCheckout = false;
      });
      saveCartItems([]);
      eventBus.emit('cart:changed', { count: 0 });
    });
    if (done) this.track('cart_cleared');
  }

  private updateGuest(items: CartItem[]): void {
    this.items = items;
    saveCartItems(items);
    eventBus.emit('cart:changed', { count: getCartCount(items) });
  }

  private track(name: string, payload?: Record<string, unknown>): void {
    eventBus.emit('analytics:track', { name, source: 'cart', payload });
  }

  // ---------------------------------------------------------------- checkout

  /** Step 1 to 2: load the address book, preselecting the default shipping address. */
  async startCheckout(): Promise<void> {
    this.track('checkout_started', { items: this.totalQuantity, total: this.subtotal });
    await this.load();
    if (!this.readyForCheckout) return;
    const done = await this.run('Could not load your addresses.', async () => {
      const addresses = await profileApi.addresses();
      runInAction(() => {
        this.addresses = addresses;
        this.selectedAddressId = (addresses.find((a) => a.defaultShipping) ?? addresses[0])?.id ?? '';
      });
    });
    if (done) {
      runInAction(() => {
        this.step = 'address';
      });
    }
  }

  async addAddress(address: AddressInput): Promise<boolean> {
    return this.run('Could not save this address.', async () => {
      const created = await profileApi.createAddress(address);
      runInAction(() => {
        this.addresses = [...this.addresses, created];
        this.selectedAddressId = created.id;
      });
    });
  }

  selectAddress(id: string): void {
    this.selectedAddressId = id;
  }

  /** Step 2 to 3: reserves the stock and creates one unpaid order per seller. */
  async placeOrder(): Promise<void> {
    this.busy = true;
    this.error = '';
    try {
      const checkout = await checkoutApi.create(
        { shippingAddressId: this.selectedAddressId, expectedTotal: this.subtotal },
        this.idempotencyKey,
      );
      saveCartItems([]);
      eventBus.emit('cart:changed', { count: 0 });
      runInAction(() => {
        this.checkout = checkout;
        this.items = [];
        this.step = 'payment';
      });
    } catch (error) {
      const code = apiErrorCode(error);
      if (code === 'ORDER_TOTAL_CHANGED' || code === 'ORDER_CART_NOT_READY') {
        // The cart moved under the customer: show the new one. It is a different purchase now.
        this.idempotencyKey = crypto.randomUUID();
        await this.load();
        runInAction(() => {
          this.step = 'cart';
        });
      }
      runInAction(() => {
        this.error = apiErrorMessage(error, 'Could not place your order.');
      });
    }
    runInAction(() => {
      this.busy = false;
    });
  }

  /** Step 3: charge. A declined payment leaves the orders unpaid, so the customer can try again. */
  async pay(paymentToken: string): Promise<void> {
    const checkout = this.checkout;
    if (!checkout) return;
    this.busy = true;
    const done = await this.run('The payment did not go through.', async () => {
      const paid = await checkoutApi.pay(checkout.id, paymentToken);
      runInAction(() => {
        this.checkout = paid;
        this.step = 'placed';
      });
    });
    runInAction(() => {
      this.busy = false;
    });
    if (done) {
      for (const order of checkout.orders) {
        eventBus.emit('order:placed', { orderId: order.id, total: order.total, currency: order.currency });
      }
      this.track('order_placed', { checkoutId: checkout.id, total: checkout.total });
    }
  }

  startNewOrder(): void {
    this.step = 'cart';
    this.checkout = null;
    this.idempotencyKey = crypto.randomUUID();
    this.serverTotal = 0;
    this.readyForCheckout = false;
  }
}
