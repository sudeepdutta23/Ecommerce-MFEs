import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { type Order, type OrderStatus } from '@ecom/types';
import { Badge, Button, ImageWithFallback, SectionHeader } from '@ecom/ui';
import { formatCurrency, formatDateTime } from '@ecom/utils';
import { useOrdersStore } from './OrdersProvider';
import { deriveStatus } from './orders.store';

const STATUS_META: Record<OrderStatus, { label: string; tone: 'warning' | 'brand' | 'positive'; icon: string }> = {
  processing: { label: 'Processing', tone: 'warning', icon: '⏳' },
  shipped: { label: 'Shipped', tone: 'brand', icon: '🚚' },
  delivered: { label: 'Delivered', tone: 'positive', icon: '✅' },
};

/** Three-step delivery progress bar driven by the derived status. */
function StatusTimeline({ status }: { status: OrderStatus }) {
  const steps: OrderStatus[] = ['processing', 'shipped', 'delivered'];
  const activeIndex = steps.indexOf(status);

  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {steps.map((step, i) => (
        <span
          key={step}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
            i <= activeIndex ? 'bg-brand-500' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

const OrderCard = observer(function OrderCard({ order }: { order: Order }) {
  const status = deriveStatus(order);
  const meta = STATUS_META[status];

  return (
    <article className="overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card transition-all duration-300 ease-out-expo hover:border-brand-200 hover:shadow-card-hover">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-surface-sunken/60 px-5 py-3">
        <div>
          <p className="font-mono text-sm font-semibold text-slate-900">{order.id}</p>
          <p className="text-xs text-slate-500">Placed {formatDateTime(order.placedAt)}</p>
        </div>
        <Badge tone={meta.tone}>
          {meta.icon} {meta.label}
        </Badge>
      </header>

      <div className="space-y-3 px-5 py-4">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
              {item.imageUrl ? (
                <ImageWithFallback
                  src={item.imageUrl}
                  alt=""
                  fallback={
                    <span className="flex h-full w-full items-center justify-center text-xl" aria-hidden>
                      📦
                    </span>
                  }
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xl" aria-hidden>
                  📦
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">
                {item.quantity} × {formatCurrency(item.price, item.currency)}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {formatCurrency(item.price * item.quantity, item.currency)}
            </p>
          </div>
        ))}
      </div>

      <footer className="space-y-3 border-t border-slate-100 px-5 py-4">
        <StatusTimeline status={status} />
        <div className="flex items-center justify-between text-sm">
          {order.savings > 0 ? (
            <p className="font-medium text-positive">
              You saved {formatCurrency(order.savings, order.currency)}
            </p>
          ) : (
            <span />
          )}
          <p className="text-slate-500">
            Total:{' '}
            <span className="text-base font-bold text-slate-900">
              {formatCurrency(order.subtotal, order.currency)}
            </span>
          </p>
        </div>
      </footer>
    </article>
  );
});

export const OrdersPage = observer(function OrdersPage() {
  const store = useOrdersStore();

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
              {store.orders.length} order{store.orders.length === 1 ? '' : 's'} ·{' '}
              {formatCurrency(store.totalSpent, store.currency)}
            </Badge>
          }
        />
      </div>

      <div className="grid animate-fade-in-up gap-5 lg:grid-cols-2">
        {store.orders.map((order, i) => (
          <div
            key={order.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(i * 80, 400)}ms` }}
          >
            <OrderCard order={order} />
          </div>
        ))}
      </div>
    </div>
  );
});
