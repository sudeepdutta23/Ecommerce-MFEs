import { Badge, Button, Card, CardBody, CardHeader, CardTitle } from '@ecom/ui';
import { formatCurrency, formatNumber, formatRelativeTime } from '@ecom/utils';
import { selectCountByName, selectTotalEvents, useAnalyticsStore } from './analytics.store';
import { StatTile } from './StatTile';
import { useEventBridge } from './useEventBridge';

export function AnalyticsPage() {
  useEventBridge();

  const events = useAnalyticsStore((state) => state.events);
  const cartValue = useAnalyticsStore((state) => state.cartValue);
  const clear = useAnalyticsStore((state) => state.clear);
  const totalEvents = useAnalyticsStore(selectTotalEvents);
  const addToCartCount = useAnalyticsStore(selectCountByName('cart_item_added'));
  const loginCount = useAnalyticsStore(selectCountByName('login'));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            This is the analytics MFE — a Zustand store fed only by the cross-MFE event bus. Sign in
            or add products to the cart in the other sections and watch events arrive here.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={clear} disabled={events.length === 0}>
          Clear session
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Events this session" value={formatNumber(totalEvents)} />
        <StatTile
          label="Items added to cart"
          value={formatNumber(addToCartCount)}
          hint="via cart:item-added"
        />
        <StatTile label="Cart value" value={formatCurrency(cartValue)} hint="sum of added items" />
        <StatTile label="Sign-ins" value={formatNumber(loginCount)} hint="via analytics:track" />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent events</CardTitle>
        </CardHeader>
        <CardBody className="px-0 py-0">
          {events.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              No events yet. Interact with the Catalog or Account sections to generate activity.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Event</th>
                    <th className="px-5 py-3 font-medium">Source</th>
                    <th className="px-5 py-3 font-medium">Details</th>
                    <th className="px-5 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-5 py-3 font-mono text-xs text-slate-900">{event.name}</td>
                      <td className="px-5 py-3">
                        <Badge tone="neutral">{event.source}</Badge>
                      </td>
                      <td className="max-w-xs truncate px-5 py-3 font-mono text-xs text-slate-500">
                        {event.payload ? JSON.stringify(event.payload) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">
                        {formatRelativeTime(event.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
