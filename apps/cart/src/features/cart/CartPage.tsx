import { useState, type FormEvent } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { type CartItem } from '@ecom/types';
import { Badge, Button, ImageWithFallback, SectionHeader, TextInput, cn } from '@ecom/ui';
import { formatCurrency } from '@ecom/utils';
import { useCartStore } from './CartProvider';
import { DECLINING_TOKEN } from './cart.store';

const PROBLEM_TEXT = {
  NOT_ON_SALE: 'No longer on sale',
  NOT_ENOUGH_STOCK: 'Not enough left in stock',
};

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
        {item.sellerName ? <p className="text-xs text-slate-500">Sold by {item.sellerName}</p> : null}
        {item.problem ? (
          <Badge tone="negative" className="mt-1">
            {PROBLEM_TEXT[item.problem]}
          </Badge>
        ) : null}
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
          onClick={() => void store.remove(item.productId)}
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
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
          <dt>
            Total ({store.totalQuantity} item{store.totalQuantity === 1 ? '' : 's'})
          </dt>
          <dd>{formatCurrency(store.subtotal, store.currency)}</dd>
        </div>
      </dl>
      {store.signedIn ? (
        <Button
          size="lg"
          className="mt-5 w-full"
          disabled={!store.readyForCheckout || store.loading}
          onClick={() => void store.startCheckout()}
        >
          Proceed to Checkout
        </Button>
      ) : (
        <Link to="/account/login" className="mt-5 block">
          <Button size="lg" className="w-full">
            Sign in to check out
          </Button>
        </Link>
      )}
      {store.signedIn && !store.readyForCheckout && !store.loading ? (
        <p className="mt-3 text-center text-xs text-slate-500">Fix or remove the marked lines to check out.</p>
      ) : null}
      {!store.signedIn ? (
        <p className="mt-3 text-center text-xs text-slate-500">Your cart moves to your account when you sign in.</p>
      ) : null}
    </aside>
  );
});

const EMPTY_ADDRESS = { recipientName: '', line1: '', city: '', postalCode: '', countryCode: '' };

const AddressForm = observer(function AddressForm({ onDone }: { onDone: () => void }) {
  const store = useCartStore();
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const field = (name: keyof typeof EMPTY_ADDRESS, label: string) => (
    <TextInput
      label={label}
      value={form[name]}
      onChange={(event) => setForm({ ...form, [name]: event.target.value })}
      required
    />
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await store.addAddress({ ...form, countryCode: form.countryCode.toUpperCase() })) onDone();
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-3 rounded-lg bg-surface-sunken p-4 sm:grid-cols-2">
      {field('recipientName', 'Recipient')}
      {field('line1', 'Street and number')}
      {field('city', 'City')}
      {field('postalCode', 'Postal code')}
      {field('countryCode', 'Country code (e.g. DE)')}
      <div className="flex items-end">
        <Button type="submit">Save address</Button>
      </div>
    </form>
  );
});

const AddressStep = observer(function AddressStep() {
  const store = useCartStore();
  const [adding, setAdding] = useState(store.addresses.length === 0);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SectionHeader
        title={
          <>
            Where should it <span className="text-brand-500">go?</span>
          </>
        }
      />
      <div className="space-y-2" role="radiogroup" aria-label="Shipping address">
        {store.addresses.map((address) => (
          <label
            key={address.id}
            className="flex cursor-pointer items-start gap-3 rounded-card border border-slate-200 bg-surface p-4 text-sm"
          >
            <input
              type="radio"
              name="address"
              checked={store.selectedAddressId === address.id}
              onChange={() => store.selectAddress(address.id)}
              className="mt-1"
            />
            <span>
              <b className="font-semibold text-slate-900">{address.recipientName}</b>
              <br />
              {address.line1}, {address.postalCode} {address.city}, {address.countryCode}
            </span>
          </label>
        ))}
      </div>
      {adding ? (
        <AddressForm onDone={() => setAdding(false)} />
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
          + Add an address
        </Button>
      )}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-base font-bold text-slate-900">{formatCurrency(store.subtotal, store.currency)}</p>
        <Button disabled={!store.selectedAddressId || store.busy} onClick={() => void store.placeOrder()}>
          {store.busy ? 'Placing order…' : 'Place order'}
        </Button>
      </div>
    </div>
  );
});

const PaymentStep = observer(function PaymentStep() {
  const store = useCartStore();
  const [token, setToken] = useState('tok_visa');
  const checkout = store.checkout;
  if (!checkout) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SectionHeader
        title={
          <>
            Pay for your <span className="text-brand-500">order</span>
          </>
        }
      />
      <ul className="divide-y divide-slate-100 rounded-card border border-slate-200 bg-surface px-4 text-sm">
        {checkout.orders.map((order) => (
          <li key={order.id} className="flex justify-between py-3">
            <span>{order.sellerName}</span>
            <span className="font-semibold">{formatCurrency(order.total, order.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="rounded-card border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Test mode: the backend has no real payment provider yet, and nothing is charged.</p>
        <div className="mt-2 flex flex-col gap-1">
          <label className="flex items-center gap-2">
            <input type="radio" checked={token === 'tok_visa'} onChange={() => setToken('tok_visa')} />
            Test card that is approved
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={token === DECLINING_TOKEN} onChange={() => setToken(DECLINING_TOKEN)} />
            Test card that is declined
          </label>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-slate-900">{formatCurrency(checkout.total, checkout.currency)}</p>
        <Button disabled={store.busy} onClick={() => void store.pay(token)}>
          {store.busy ? 'Paying…' : 'Pay now'}
        </Button>
      </div>
      <p className="text-center text-xs text-slate-500">
        Unpaid orders are cancelled after 30 minutes, and the items go back on sale.
      </p>
    </div>
  );
});

export const CartPage = observer(function CartPage() {
  const store = useCartStore();

  const error = store.error ? (
    <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-negative">
      {store.error}
    </p>
  ) : null;

  if (store.step === 'address') {
    return (
      <>
        {error}
        <AddressStep />
      </>
    );
  }

  if (store.step === 'payment') {
    return (
      <>
        {error}
        <PaymentStep />
      </>
    );
  }

  if (store.step === 'placed') {
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
      {error}
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
              onClick={() => void store.clear()}
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
