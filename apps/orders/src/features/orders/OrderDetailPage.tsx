import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Spinner, TextInput } from '@ecom/ui';
import { formatCurrency, formatDateTime, type AddressSnapshot } from '@ecom/utils';
import { useOrdersStore } from './OrdersProvider';
import { STATUS_META } from './order-status';

function AddressBlock({ title, address }: { title: string; address: AddressSnapshot | null }) {
  if (!address) return null;
  return (
    <div className="text-sm text-slate-600">
      <h2 className="mb-1 font-semibold text-slate-900">{title}</h2>
      <p>{address.recipientName}</p>
      <p>
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ''}
      </p>
      <p>
        {address.postalCode} {address.city}, {address.countryCode}
      </p>
    </div>
  );
}

export const OrderDetailPage = observer(function OrderDetailPage() {
  const store = useOrdersStore();
  const { orderId = '' } = useParams();
  const [reason, setReason] = useState('');
  const order = store.order;

  useEffect(() => {
    void store.loadOrder(orderId);
  }, [store, orderId]);

  if (store.orderLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p role="alert" className="text-slate-600">
          {store.error || 'We could not find this order.'}
        </p>
        <Link to=".." className="text-sm font-semibold text-brand-600">
          ← Back to my orders
        </Link>
      </div>
    );
  }

  const meta = STATUS_META[order.status];
  const canCancel = order.status === 'PENDING_PAYMENT' || order.status === 'PAID';
  const timeline = [
    ['Placed', order.createdAt],
    ['Paid', order.paidAt],
    ['Shipped', order.shippedAt],
    ['Delivered', order.deliveredAt],
    ['Cancelled', order.cancelledAt],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to=".." className="text-sm font-semibold text-brand-600">
        ← Back to my orders
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{order.sellerName}</h1>
          <p className="font-mono text-xs text-slate-400">{order.id}</p>
        </div>
        <Badge tone={meta.tone}>
          {meta.icon} {meta.label}
        </Badge>
      </header>

      {store.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-negative">
          {store.error}
        </p>
      ) : null}

      <ul className="divide-y divide-slate-100 rounded-card border border-slate-200 bg-surface px-5 text-sm">
        {order.lines.map((line) => (
          <li key={line.productId} className="flex items-center justify-between gap-4 py-3">
            <span className="min-w-0">
              <Link to={`/catalog/${line.productId}`} className="truncate text-slate-900 hover:text-brand-600">
                {line.name}
              </Link>
              <span className="block text-xs text-slate-500">
                {line.quantity} × {formatCurrency(line.unitPrice, order.currency)}
              </span>
            </span>
            <span className="font-semibold text-slate-900">{formatCurrency(line.lineTotal, order.currency)}</span>
          </li>
        ))}
        <li className="flex justify-between py-3 text-base font-bold text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(order.total, order.currency)}</span>
        </li>
      </ul>

      <div className="grid gap-6 sm:grid-cols-3">
        <AddressBlock title="Shipping to" address={order.shippingAddress} />
        <AddressBlock title="Billing" address={order.billingAddress} />
        <div className="text-sm text-slate-600">
          <h2 className="mb-1 font-semibold text-slate-900">Timeline</h2>
          {timeline.map(([label, at]) => (
            <p key={label}>
              {label}: {formatDateTime(at)}
            </p>
          ))}
          {order.trackingNumber ? <p className="mt-2">Tracking: {order.trackingNumber}</p> : null}
          {order.cancelReason ? <p className="mt-2">Reason: {order.cancelReason}</p> : null}
        </div>
      </div>

      {order.status === 'PENDING_PAYMENT' && order.checkoutId ? (
        <div className="rounded-card border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p>Not paid yet. Test mode: nothing is really charged.</p>
          <Button
            className="mt-2"
            disabled={store.busy}
            onClick={() => void store.pay(order.checkoutId as string, order.id, 'tok_visa')}
          >
            Pay with test card
          </Button>
        </div>
      ) : null}

      {canCancel ? (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <TextInput label="Reason (optional)" value={reason} onChange={(event) => setReason(event.target.value)} />
          <Button variant="danger" disabled={store.busy} onClick={() => void store.cancel(order.id, reason)}>
            Cancel this order
          </Button>
          {order.status === 'PAID' ? <p className="text-xs text-slate-500">The payment will be refunded.</p> : null}
        </div>
      ) : null}
    </div>
  );
});
