import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Badge, Button, SectionHeader, Spinner } from '@ecom/ui';
import { formatCurrency, formatDateTime, type OrderSummary } from '@ecom/utils';
import { useOrdersStore } from './OrdersProvider';
import { STATUS_META } from './order-status';

function OrderCard({ order }: { order: OrderSummary }) {
  const meta = STATUS_META[order.status];

  return (
    <Link
      to={order.id}
      className="block overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card transition-all duration-300 ease-out-expo hover:border-brand-200 hover:shadow-card-hover"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-surface-sunken/60 px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{order.sellerName}</p>
          <p className="text-xs text-slate-500">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <Badge tone={meta.tone}>
          {meta.icon} {meta.label}
        </Badge>
      </header>
      <footer className="flex items-center justify-between px-5 py-4 text-sm">
        <span className="font-mono text-xs text-slate-400">{order.id.slice(0, 8)}</span>
        <span className="text-base font-bold text-slate-900">{formatCurrency(order.total, order.currency)}</span>
      </footer>
    </Link>
  );
}

export const OrdersPage = observer(function OrdersPage() {
  const store = useOrdersStore();

  useEffect(() => {
    void store.load(0);
  }, [store]);

  if (!store.signedIn) {
    return (
      <div className="flex min-h-[50vh] animate-fade-in-up flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to see your orders</h1>
        <Link to="/account/login">
          <Button size="lg">Sign in</Button>
        </Link>
      </div>
    );
  }

  if (store.loading && store.orders.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (store.error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p role="alert" className="text-slate-600">
          {store.error}
        </p>
        <Button variant="secondary" onClick={() => void store.load()}>
          Retry
        </Button>
      </div>
    );
  }

  if (store.orders.length === 0) {
    return (
      <div className="flex min-h-[50vh] animate-fade-in-up flex-col items-center justify-center gap-4 text-center">
        <span className="animate-float text-6xl" aria-hidden>
          📦
        </span>
        <h1 className="text-2xl font-bold text-slate-900">No orders yet</h1>
        <p className="max-w-md text-sm text-slate-600">
          Once you check out, your orders and their delivery status will show up here.
        </p>
        <Link to="/catalog" className="mt-2">
          <Button size="lg">Start shopping</Button>
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
              My <span className="text-brand-500">Orders</span>
            </>
          }
          action={
            <Badge tone="brand">
              {store.total} order{store.total === 1 ? '' : 's'}
            </Badge>
          }
        />
      </div>

      <div className="grid animate-fade-in-up gap-5 lg:grid-cols-2">
        {store.orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {store.totalPages > 1 ? (
        <nav aria-label="Orders pagination" className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Page {store.page + 1} of {store.totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={store.page === 0} onClick={() => void store.load(store.page - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={store.page + 1 >= store.totalPages}
              onClick={() => void store.load(store.page + 1)}
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
});
