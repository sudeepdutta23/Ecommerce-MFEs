import { useMemo, useState } from 'react';
import { ImageWithFallback, SectionHeader } from '@ecom/ui';
import { formatCurrency, formatRelativeTime } from '@ecom/utils';
import { useAdminStore } from '../admin.store';
import { StatCard } from '../components/StatCard';
import { InboxIcon, SearchIcon } from '../icons';

interface ProductPerformance {
  productId: string;
  name: string;
  imageUrl?: string;
  currency: string;
  units: number;
  orderCount: number;
  revenue: number;
  lastSoldAt: number;
}

/**
 * Product performance, derived entirely from order lines in the shared
 * order-storage contract — the catalog's own data stays private to the
 * catalog MFE, so sales history is the admin console's source of truth.
 */
export function ProductsPage() {
  const orders = useAdminStore((state) => state.orders);
  const [query, setQuery] = useState('');

  const products = useMemo(() => {
    const byProduct = new Map<string, ProductPerformance>();
    for (const order of orders) {
      for (const item of order.items) {
        const entry = byProduct.get(item.productId) ?? {
          productId: item.productId,
          name: item.name,
          imageUrl: item.imageUrl,
          currency: item.currency,
          units: 0,
          orderCount: 0,
          revenue: 0,
          lastSoldAt: 0,
        };
        entry.units += item.quantity;
        entry.orderCount += 1;
        entry.revenue += item.price * item.quantity;
        entry.lastSoldAt = Math.max(entry.lastSoldAt, order.placedAt);
        byProduct.set(item.productId, entry);
      }
    }
    return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0);
  const totalUnits = products.reduce((sum, product) => sum + product.units, 0);
  const currency = products[0]?.currency ?? 'INR';

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? products.filter((product) => product.name.toLowerCase().includes(needle))
    : products;

  return (
    <div className="space-y-5">
      <SectionHeader
        title={
          <>
            Product <span className="text-brand-500">performance</span>
          </>
        }
        action={<span>{products.length} products sold to date</span>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Products sold" value={products.length} sub="Distinct SKUs with sales" />
        <StatCard label="Units moved" value={totalUnits} sub="Across all orders" />
        <StatCard
          label="Best seller"
          value={products[0]?.revenue ?? 0}
          format={(value) => formatCurrency(value, currency)}
          sub={products[0]?.name ?? '—'}
        />
      </div>

      <div className="relative w-full sm:w-72">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter products…"
          aria-label="Filter products"
          className="w-full rounded-lg border-0 bg-surface py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-14 text-center">
          <InboxIcon className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">
            {products.length === 0 ? 'No sales yet' : 'No products match your filter'}
          </p>
          <p className="text-xs text-slate-500">
            {products.length === 0
              ? 'Performance is derived from placed orders — it fills in with the first checkout.'
              : 'Try a different product name.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-slate-200 bg-surface shadow-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-4 py-3 text-right font-medium">Units</th>
                <th className="px-4 py-3 text-right font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Last sold</th>
                <th className="px-4 py-3 text-right font-medium">Revenue</th>
                <th className="px-5 py-3 font-medium">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((product) => {
                const share = totalRevenue ? (product.revenue / totalRevenue) * 100 : 0;
                return (
                  <tr key={product.productId} className="transition-colors hover:bg-surface-sunken/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-sunken ring-1 ring-slate-200">
                          {product.imageUrl ? (
                            <ImageWithFallback src={product.imageUrl} alt="" fallback={<span aria-hidden>📦</span>} />
                          ) : (
                            <span aria-hidden>📦</span>
                          )}
                        </span>
                        <span className="min-w-0 truncate font-medium text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">{product.units}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">{product.orderCount}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatRelativeTime(product.lastSoldAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                      {formatCurrency(product.revenue, product.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-sunken">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${share}%` }} />
                        </div>
                        <span className="w-10 text-xs tabular-nums text-slate-500">{share.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
