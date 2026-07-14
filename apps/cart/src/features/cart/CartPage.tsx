import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { type CartItem } from '@ecom/types';
import { Badge, Button, ImageWithFallback, SectionHeader, cn } from '@ecom/ui';
import { formatCurrency } from '@ecom/utils';
import { useCartStore } from './CartProvider';

const CartItemRow = observer(function CartItemRow({ item }: { item: CartItem }) {
  const store = useCartStore();
  const hasDiscount = item.mrp !== undefined && item.mrp > item.price;

  return (
    <div className="flex items-center gap-4 rounded-card border border-slate-200 bg-surface p-4 shadow-card transition-all duration-300 ease-out-expo hover:border-brand-200 hover:shadow-card-hover">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-sunken sm:h-24 sm:w-24">
        {item.imageUrl ? (
          <ImageWithFallback
            src={item.imageUrl}
            alt=""
            fallback={
              <span className="flex h-full w-full items-center justify-center text-3xl" aria-hidden>
                📦
              </span>
            }
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl" aria-hidden>
            📦
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-bold text-slate-900">
            {formatCurrency(item.price, item.currency)}
          </span>
          {hasDiscount ? (
            <span className="text-xs text-slate-400 line-through">
              {formatCurrency(item.mrp!, item.currency)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Line total:{' '}
          <span className="font-semibold text-slate-700">
            {formatCurrency(item.price * item.quantity, item.currency)}
          </span>
        </p>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div
          className="flex items-center rounded-lg border border-slate-200"
          role="group"
          aria-label={`Quantity of ${item.name}`}
        >
          <button
            type="button"
            onClick={() => store.decrement(item.productId)}
            aria-label="Decrease quantity"
            className="flex h-8 w-8 items-center justify-center rounded-l-lg text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-600 active:bg-brand-100"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold text-slate-900">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => store.increment(item.productId)}
            aria-label="Increase quantity"
            className="flex h-8 w-8 items-center justify-center rounded-r-lg text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-600 active:bg-brand-100"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => store.remove(item.productId)}
          className="text-xs font-medium text-slate-400 transition-colors hover:text-negative"
        >
          Remove
        </button>
      </div>
    </div>
  );
});

const OrderSummary = observer(function OrderSummary() {
  const store = useCartStore();

  return (
    <aside className="h-fit rounded-card border border-slate-200 bg-surface p-6 shadow-card">
      <h2 className="text-base font-semibold text-slate-900">Order Summary</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between text-slate-600">
          <dt>
            Subtotal ({store.totalQuantity} item{store.totalQuantity === 1 ? '' : 's'})
          </dt>
          <dd className="font-medium text-slate-900">
            {formatCurrency(store.subtotal, store.currency)}
          </dd>
        </div>
        {store.savings > 0 ? (
          <div className="flex justify-between text-slate-600">
            <dt>Savings</dt>
            <dd className="font-medium text-positive">
              − {formatCurrency(store.savings, store.currency)}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between text-slate-600">
          <dt>Delivery</dt>
          <dd className="font-medium text-positive">FREE</dd>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
          <dt>Total</dt>
          <dd>{formatCurrency(store.subtotal, store.currency)}</dd>
        </div>
      </dl>
      <Button
        size="lg"
        className="mt-5 w-full"
        disabled={store.checkoutState === 'placing'}
        onClick={() => void store.placeOrder()}
      >
        {store.checkoutState === 'placing' ? 'Placing order…' : 'Proceed to Checkout'}
      </Button>
      <p className="mt-3 text-center text-xs text-slate-400">
        🔒 Secure checkout · 7-day replacement
      </p>
    </aside>
  );
});

export const CartPage = observer(function CartPage() {
  const store = useCartStore();

  if (store.checkoutState === 'placed') {
    return (
      <div className="flex min-h-[50vh] animate-fade-in-up flex-col items-center justify-center gap-4 text-center">
        <span className="animate-pop text-6xl" aria-hidden>
          🎉
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Order placed successfully!</h1>
        <p className="max-w-md text-sm text-slate-600">
          Thanks for shopping with us. You can follow your delivery under My Orders — we&apos;ve
          cleared your cart for the next haul.
        </p>
        <div className="mt-2 flex gap-3">
          <Link to="/orders">
            <Button onClick={() => store.startNewOrder()}>View my orders</Button>
          </Link>
          <Link to="/catalog">
            <Button variant="ghost" onClick={() => store.startNewOrder()}>
              Continue shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (store.items.length === 0) {
    return (
      <div className="flex min-h-[50vh] animate-fade-in-up flex-col items-center justify-center gap-4 text-center">
        <span className="animate-float text-6xl" aria-hidden>
          🛒
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="max-w-md text-sm text-slate-600">
          Looks like you haven&apos;t added anything yet. Explore the catalog and grab today&apos;s
          best deals.
        </p>
        <Link to="/catalog" className="mt-2">
          <Button size="lg">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <SectionHeader
          title={
            <>
              Shopping <span className="text-brand-500">Cart</span>
            </>
          }
          action={
            <Badge tone="brand" key={store.totalQuantity} className="animate-pop">
              🛒 {store.totalQuantity} item{store.totalQuantity === 1 ? '' : 's'}
            </Badge>
          }
        />
      </div>

      <div className="grid animate-fade-in-up gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          {store.items.map((item, i) => (
            <div
              key={item.productId}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 60, 360)}ms` }}
            >
              <CartItemRow item={item} />
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/catalog"
              className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              ← Continue shopping
            </Link>
            <button
              type="button"
              onClick={() => store.clear()}
              className={cn(
                'text-sm font-medium text-slate-400 transition-colors hover:text-negative',
              )}
            >
              Clear cart
            </button>
          </div>
        </div>

        <OrderSummary />
      </div>
    </div>
  );
});
