import { Fragment, useMemo, useState } from 'react';
import { type Order, type OrderStatus } from '@ecom/types';
import { Badge, Button, SectionHeader, cn } from '@ecom/ui';
import { effectiveOrderStatus, formatCurrency, formatDateTime } from '@ecom/utils';
import { useAdminStore } from '../admin.store';
import { useAdminSession } from '../useAdminSession';
import { downloadOrdersCsv } from '../export-csv';
import { ADVANCE_ACTION_LABEL, STATUS_LABEL, STATUS_TONE } from '../status';
import { ChevronDownIcon, DownloadIcon, InboxIcon, SearchIcon } from '../icons';

const PAGE_SIZE = 8;

type StatusFilter = 'all' | OrderStatus;
type SortKey = 'newest' | 'oldest' | 'total';

const SORTERS: Record<SortKey, (a: Order, b: Order) => number> = {
  newest: (a, b) => b.placedAt - a.placedAt,
  oldest: (a, b) => a.placedAt - b.placedAt,
  total: (a, b) => b.subtotal - a.subtotal,
};

function orderUnits(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function OrdersPage() {
  const orders = useAdminStore((state) => state.orders);
  const advanceOrder = useAdminStore((state) => state.advanceOrder);
  const logAction = useAdminStore((state) => state.logAction);
  const user = useAdminSession();
  const actor = user?.name ?? 'admin';

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { all: orders.length, processing: 0, shipped: 0, delivered: 0 };
    for (const order of orders) counts[effectiveOrderStatus(order)] += 1;
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders
      .filter((order) => {
        if (statusFilter !== 'all' && effectiveOrderStatus(order) !== statusFilter) return false;
        if (!needle) return true;
        return (
          order.id.toLowerCase().includes(needle) ||
          order.items.some((item) => item.name.toLowerCase().includes(needle))
        );
      })
      .sort(SORTERS[sortKey]);
  }, [orders, query, statusFilter, sortKey]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleExport = () => {
    downloadOrdersCsv(filtered);
    logAction(actor, 'orders:exported', `Exported ${filtered.length} orders as CSV`);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title={
          <>
            Order <span className="text-brand-500">operations</span>
          </>
        }
        action={
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <DownloadIcon className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />

      {/* Toolbar: status chips + search + sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5" role="group" aria-label="Filter by status">
          {(['all', 'processing', 'shipped', 'delivered'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                statusFilter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-sunken text-slate-600 hover:bg-brand-50 hover:text-brand-700',
              )}
            >
              {status === 'all' ? 'All' : STATUS_LABEL[status]} · {statusCounts[status]}
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-full sm:w-64">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Order ID or product…"
            aria-label="Search orders"
            className="w-full rounded-lg border-0 bg-surface py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>

        <select
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as SortKey)}
          aria-label="Sort orders"
          className="rounded-lg border-0 bg-surface py-2 pl-3 pr-8 text-sm text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="total">Highest total</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-14 text-center">
          <InboxIcon className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">No matching orders</p>
          <p className="text-xs text-slate-500">
            {orders.length === 0
              ? 'Orders appear here the moment a customer checks out.'
              : 'Try a different search or status filter.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-slate-200 bg-surface shadow-card">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 text-right font-medium">Units</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((order) => {
                const status = effectiveOrderStatus(order);
                const actionLabel = ADVANCE_ACTION_LABEL[status];
                const expanded = expandedId === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr
                      className={cn('transition-colors hover:bg-surface-sunken/60', expanded && 'bg-surface-sunken/60')}
                    >
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : order.id)}
                          aria-expanded={expanded}
                          className="flex items-center gap-2 font-mono text-sm font-semibold text-slate-900 hover:text-brand-700"
                        >
                          <ChevronDownIcon
                            className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', expanded && 'rotate-180')}
                          />
                          {order.id}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                        {formatDateTime(order.placedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-slate-600">
                        {orderUnits(order)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                        {formatCurrency(order.subtotal, order.currency)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {actionLabel ? (
                          <Button variant="secondary" size="sm" onClick={() => advanceOrder(order.id, actor)}>
                            {actionLabel}
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">Complete</span>
                        )}
                      </td>
                    </tr>
                    {expanded ? (
                      <tr className="bg-surface-sunken/60">
                        <td colSpan={6} className="px-5 pb-4 pt-1">
                          <ul className="divide-y divide-slate-200/70 rounded-lg bg-surface px-4 ring-1 ring-slate-200">
                            {order.items.map((item) => (
                              <li key={item.productId} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                                <span className="min-w-0 truncate text-slate-700">
                                  {item.name}
                                  <span className="ml-2 text-xs text-slate-400">× {item.quantity}</span>
                                </span>
                                <span className="shrink-0 tabular-nums text-slate-600">
                                  {formatCurrency(item.price * item.quantity, item.currency)}
                                </span>
                              </li>
                            ))}
                            {order.savings > 0 ? (
                              <li className="flex items-center justify-between gap-4 py-2.5 text-sm">
                                <span className="text-positive">Customer savings</span>
                                <span className="tabular-nums text-positive">
                                  −{formatCurrency(order.savings, order.currency)}
                                </span>
                              </li>
                            ) : null}
                          </ul>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 ? (
        <nav aria-label="Orders pagination" className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Page {currentPage} of {pageCount} · {filtered.length} orders
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
