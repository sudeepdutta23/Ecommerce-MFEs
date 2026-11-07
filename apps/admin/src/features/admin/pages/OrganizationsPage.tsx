import { useState } from 'react';
import { Badge, Button, Notice, Pager, SectionHeader, Spinner, useResource } from '@ecom/ui';
import { adminApi, apiErrorMessage, formatDateTime, type AdminOrganizationSummary, type OrganizationStatus } from '@ecom/utils';
import { useAdminAction } from '../useAdminAction';

const STATUSES: Array<OrganizationStatus | ''> = ['', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'CLOSED'];

function Row({ shop, onChanged }: { shop: AdminOrganizationSummary; onChanged: () => Promise<void> }) {
  const { error, run } = useAdminAction(onChanged);
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const detail = useResource(() => (open ? adminApi.organization(shop.id) : Promise.resolve(null)), [open, shop.status]);

  return (
    <li className="space-y-2 px-5 py-3.5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="min-w-0 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
          <b className="font-semibold text-slate-900">{shop.name}</b>
          <span className="ml-2 text-slate-400">{shop.slug}</span>
          <span className="ml-2 text-xs text-slate-500">{formatDateTime(shop.createdAt)}</span>
        </button>
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone={shop.status === 'ACTIVE' ? 'positive' : 'warning'}>{shop.status}</Badge>
          {shop.status === 'PENDING_APPROVAL' ? (
            <Button size="sm" onClick={() => void run(() => adminApi.approveOrganization(shop.id))}>
              Approve
            </Button>
          ) : null}
          {shop.status === 'SUSPENDED' ? (
            <Button variant="secondary" size="sm" onClick={() => void run(() => adminApi.reactivateOrganization(shop.id))}>
              Reactivate
            </Button>
          ) : null}
          {shop.status === 'ACTIVE' ? (
            <>
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason"
                aria-label={`Reason for suspending ${shop.name}`}
                className="w-40 rounded-lg border-0 px-3 py-1.5 ring-1 ring-inset ring-slate-300"
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={!reason.trim()}
                onClick={() => void run(() => adminApi.suspendOrganization(shop.id, reason))}
              >
                Suspend
              </Button>
            </>
          ) : null}
          {shop.status !== 'CLOSED' ? (
            <Button variant="danger" size="sm" onClick={() => void run(() => adminApi.closeOrganization(shop.id))}>
              Close
            </Button>
          ) : null}
        </span>
      </div>
      <Notice>{error}</Notice>
      {open && detail.data ? (
        <p className="text-xs text-slate-500">
          {detail.data.members} members, {detail.data.owners} owners
          {detail.data.statusReason ? ` · reason: ${detail.data.statusReason}` : ''}
        </p>
      ) : null}
    </li>
  );
}

export function OrganizationsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<OrganizationStatus | ''>('PENDING_APPROVAL');
  const shops = useResource(
    () => adminApi.organizations({ page, size: 20, status: status || undefined }),
    [page, status],
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title={
          <>
            Seller <span className="text-brand-500">shops</span>
          </>
        }
        action={<span>{shops.data?.totalElements ?? 0} shops</span>}
      />
      <select
        value={status}
        aria-label="Filter by status"
        onChange={(event) => {
          setPage(0);
          setStatus(event.target.value as OrganizationStatus | '');
        }}
        className="rounded-lg border-0 bg-surface py-2 pl-3 pr-8 text-sm shadow-sm ring-1 ring-inset ring-slate-300"
      >
        {STATUSES.map((option) => (
          <option key={option} value={option}>
            {option || 'All statuses'}
          </option>
        ))}
      </select>
      <Notice>{shops.error ? apiErrorMessage(shops.error) : ''}</Notice>
      {shops.loading && !shops.data ? <Spinner /> : null}
      {shops.data?.content.length === 0 ? <p className="text-sm text-slate-500">No shops here.</p> : null}
      <ul className="divide-y divide-slate-100 rounded-card border border-slate-200 bg-surface shadow-card">
        {shops.data?.content.map((shop) => (
          <Row key={shop.id} shop={shop} onChanged={shops.reload} />
        ))}
      </ul>
      <Pager page={page} totalPages={shops.data?.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}
