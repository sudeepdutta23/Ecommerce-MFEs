import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle, Notice, SectionHeader, useResource } from '@ecom/ui';
import { adminApi, apiErrorMessage, formatRelativeTime } from '@ecom/utils';
import { StatCard } from '../components/StatCard';

/**
 * What the backend can answer today: how many accounts and shops exist, what is waiting, and the latest
 * administrative actions. Sales figures need an endpoint it does not have (no cross-seller order list).
 */
export function OverviewPage() {
  const users = useResource(() => adminApi.users({ size: 1 }), []);
  const shops = useResource(() => adminApi.organizations({ size: 1 }), []);
  const pending = useResource(() => adminApi.organizations({ status: 'PENDING_APPROVAL', size: 1 }), []);
  const audit = useResource(() => adminApi.audit({ size: 8 }), []);
  const error = users.error ?? shops.error ?? audit.error;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={
          <>
            Operations <span className="text-brand-500">overview</span>
          </>
        }
      />
      <Notice>{error ? apiErrorMessage(error) : ''}</Notice>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Accounts" value={users.data?.totalElements ?? 0} sub="All statuses" />
        <StatCard label="Shops" value={shops.data?.totalElements ?? 0} sub="All statuses" />
        <StatCard
          label="Shops awaiting approval"
          value={pending.data?.totalElements ?? 0}
          sub={<Link to="organizations">Review</Link>}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest administrative actions</CardTitle>
        </CardHeader>
        <CardBody className="px-0 py-0">
          {audit.data?.items.length === 0 ? <p className="px-5 py-6 text-sm text-slate-500">Nothing yet.</p> : null}
          <ul className="divide-y divide-slate-100 text-sm">
            {audit.data?.items.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <span className="font-mono text-xs text-slate-700">{event.action}</span>
                <span className="text-xs text-slate-500">{formatRelativeTime(event.occurredAt)}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
