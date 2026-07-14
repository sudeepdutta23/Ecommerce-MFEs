import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Reveal } from '@ecom/ui';
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
      <div className="flex animate-fade-in-down flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-slate-900">
            Live analytics
            <span className="relative flex h-2.5 w-2.5" aria-label="Live">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-positive" />
            </span>
          </h1>
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
        {(
          [
            { label: 'Events this session', value: totalEvents, format: formatNumber },
            {
              label: 'Items added to cart',
              value: addToCartCount,
              format: formatNumber,
              hint: 'via cart:item-added',
            },
            {
              label: 'Cart value',
              value: cartValue,
              format: (v: number) => formatCurrency(v),
              hint: 'sum of added items',
            },
            { label: 'Sign-ins', value: loginCount, format: formatNumber, hint: 'via analytics:track' },
          ] as const
        ).map((stat, i) => (
          <Reveal key={stat.label} delay={i * 80}>
            <StatTile
              label={stat.label}
              value={stat.value}
              format={stat.format}
              hint={'hint' in stat ? stat.hint : undefined}
            />
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent events</CardTitle>
            {events.length > 0 ? <Badge tone="brand">{events.length} captured</Badge> : null}
          </CardHeader>
          <CardBody className="px-0 py-0">
            {events.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <span className="mb-3 inline-block animate-float text-4xl" aria-hidden>
                  📡
                </span>
                <p className="text-sm text-slate-500">
                  No events yet. Interact with the Catalog or Account sections to generate activity.
                </p>
              </div>
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
                      /* Rows animate once on mount, so only newly-arrived events slide in. */
                      <tr
                        key={event.id}
                        className="animate-fade-in-down border-b border-slate-50 transition-colors last:border-0 hover:bg-surface-sunken"
                      >
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
      </Reveal>
    </div>
  );
}
