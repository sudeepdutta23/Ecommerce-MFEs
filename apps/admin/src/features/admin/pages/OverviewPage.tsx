import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { type CartItem, type OrderStatus } from '@ecom/types';
import { Badge, Card, CardBody, CardHeader, CardTitle, SectionHeader } from '@ecom/ui';
import {
  ORDER_STATUS_FLOW,
  effectiveOrderStatus,
  eventBus,
  formatCurrency,
  formatRelativeTime,
  getCartItems,
} from '@ecom/utils';
import { useAdminStore } from '../admin.store';
import { StatCard } from '../components/StatCard';
import { STATUS_BAR_CLASS, STATUS_LABEL, STATUS_TONE } from '../status';
import { InboxIcon } from '../icons';

/** Live view of carts customers currently have open (shared cart-storage). */
function useOpenCart(): CartItem[] {
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());

  useEffect(() => eventBus.on('cart:changed', () => setItems(getCartItems())), []);

  return items;
}

export function OverviewPage() {
  const orders = useAdminStore((state) => state.orders);
  const cartItems = useOpenCart();

  const kpis = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + order.subtotal, 0);
    const units = orders.reduce(
      (sum, order) => sum + order.items.reduce((n, item) => n + item.quantity, 0),
      0,
    );
    const savings = orders.reduce((sum, order) => sum + order.savings, 0);
    const byStatus = { processing: 0, shipped: 0, delivered: 0 } as Record<OrderStatus, number>;
    for (const order of orders) byStatus[effectiveOrderStatus(order)] += 1;
    return { revenue, units, savings, byStatus };
  }, [orders]);

  const topProducts = useMemo(() => {
    const byProduct = new Map<string, { name: string; units: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const entry = byProduct.get(item.productId) ?? { name: item.name, units: 0, revenue: 0 };
        entry.units += item.quantity;
        entry.revenue += item.price * item.quantity;
        byProduct.set(item.productId, entry);
      }
    }
    return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  const cartValue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = orders[0]?.currency ?? cartItems[0]?.currency ?? 'INR';
  const inCurrency = (value: number) => formatCurrency(value, currency);
  const recentOrders = orders.slice(0, 5);
  const maxProductRevenue = topProducts[0]?.revenue ?? 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={
          <>
            Business <span className="text-brand-500">overview</span>
          </>
        }
        action={<span>{orders.length} orders on record</span>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Gross revenue" value={kpis.revenue} format={inCurrency} sub="All placed orders" />
        <StatCard
          label="Orders"
          value={orders.length}
          sub={`${kpis.byStatus.processing} awaiting fulfillment`}
        />
        <StatCard
          label="Avg order value"
          value={orders.length ? kpis.revenue / orders.length : 0}
          format={inCurrency}
          sub={`${kpis.units} units sold`}
        />
        <StatCard label="Discounts given" value={kpis.savings} format={inCurrency} sub="Total customer savings" />
        <StatCard
          label="Open cart value"
          value={cartValue}
          format={inCurrency}
          sub="Live — updates as customers shop"
        />
        <StatCard
          label="Fulfillment rate"
          value={orders.length ? (kpis.byStatus.delivered / orders.length) * 100 : 0}
          format={(value) => `${Math.round(value)}%`}
          sub={`${kpis.byStatus.delivered} of ${orders.length} delivered`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Fulfillment pipeline</CardTitle>
            <Link to="orders" className="text-sm text-brand-600 hover:text-brand-700">
              Manage orders ›
            </Link>
          </CardHeader>
          <CardBody>
            {orders.length === 0 ? (
              <EmptyNote>No orders yet — the pipeline fills in as customers check out.</EmptyNote>
            ) : (
              <>
                <div className="flex h-3 overflow-hidden rounded-full bg-surface-sunken">
                  {ORDER_STATUS_FLOW.map((status) =>
                    kpis.byStatus[status] > 0 ? (
                      <div
                        key={status}
                        className={STATUS_BAR_CLASS[status]}
                        style={{ width: `${(kpis.byStatus[status] / orders.length) * 100}%` }}
                        title={`${STATUS_LABEL[status]}: ${kpis.byStatus[status]}`}
                      />
                    ) : null,
                  )}
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3">
                  {ORDER_STATUS_FLOW.map((status) => (
                    <div key={status} className="rounded-lg bg-surface-sunken px-3 py-2.5">
                      <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span
                          aria-hidden
                          className={`h-2 w-2 rounded-full ${STATUS_BAR_CLASS[status]}`}
                        />
                        {STATUS_LABEL[status]}
                      </dt>
                      <dd className="mt-1 text-lg font-bold text-slate-900">
                        {kpis.byStatus[status]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Top products by revenue</CardTitle>
            <Link to="products" className="text-sm text-brand-600 hover:text-brand-700">
              All products ›
            </Link>
          </CardHeader>
          <CardBody>
            {topProducts.length === 0 ? (
              <EmptyNote>Product performance appears here after the first sale.</EmptyNote>
            ) : (
              <ol className="space-y-3">
                {topProducts.map((product) => (
                  <li key={product.name}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-medium text-slate-800">{product.name}</span>
                      <span className="shrink-0 font-semibold text-slate-900">
                        {inCurrency(product.revenue)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{
                            width: `${maxProductRevenue ? (product.revenue / maxProductRevenue) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">{product.units} units</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent orders</CardTitle>
          <Link to="orders" className="text-sm text-brand-600 hover:text-brand-700">
            View all ›
          </Link>
        </CardHeader>
        <CardBody className="px-0 py-0">
          {recentOrders.length === 0 ? (
            <div className="px-5 py-4">
              <EmptyNote>Orders placed in the storefront show up here immediately.</EmptyNote>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentOrders.map((order) => {
                const status = effectiveOrderStatus(order);
                return (
                  <li key={order.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-semibold text-slate-900">{order.id}</p>
                      <p className="text-xs text-slate-500">
                        {formatRelativeTime(order.placedAt)} ·{' '}
                        {order.items.reduce((n, item) => n + item.quantity, 0)} units
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(order.subtotal, order.currency)}
                    </span>
                    <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function EmptyNote({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2.5 rounded-lg bg-surface-sunken px-4 py-3 text-sm text-slate-500">
      <InboxIcon className="h-4 w-4 shrink-0 text-slate-400" />
      {children}
    </p>
  );
}
