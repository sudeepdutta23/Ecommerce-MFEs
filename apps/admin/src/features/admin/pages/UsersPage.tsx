import { useState } from 'react';
import { Badge, Button, Card, CardBody, Notice, Pager, SectionHeader, Spinner, useResource } from '@ecom/ui';
import { adminApi, apiErrorMessage, formatDateTime, type UserStatus } from '@ecom/utils';
import { useAdminAction } from '../useAdminAction';

const STATUSES: Array<UserStatus | ''> = ['', 'PENDING_VERIFICATION', 'ACTIVE', 'DEACTIVATED', 'SUSPENDED', 'ERASED'];

function UserPanel({ userId, onChanged }: { userId: string; onChanged: () => Promise<void> }) {
  const user = useResource(() => adminApi.user(userId), [userId]);
  const profile = useResource(() => adminApi.userProfile(userId), [userId]);
  const assigned = useResource(() => adminApi.userRoles(userId), [userId]);
  const roles = useResource(() => adminApi.roles(), []);
  const { error, run } = useAdminAction(async () => {
    await Promise.all([user.reload(), assigned.reload(), onChanged()]);
  });
  const [reason, setReason] = useState('');
  const [confirmErase, setConfirmErase] = useState(false);
  const data = user.data;

  if (!data) return user.loading ? <Spinner /> : <Notice>{apiErrorMessage(user.error)}</Notice>;

  const fullName = [profile.data?.givenName, profile.data?.familyName].filter(Boolean).join(' ');
  const unassigned = roles.data?.filter((role) => !assigned.data?.some((a) => a.roleId === role.id)) ?? [];

  return (
    <Card>
      <CardBody className="space-y-3 text-sm">
        <Notice>{error}</Notice>
        <p className="font-semibold text-slate-900">
          {data.email} {fullName ? `(${fullName})` : ''}
        </p>
        <p className="text-slate-600">
          Last sign-in: {data.lastLoginAt ? formatDateTime(data.lastLoginAt) : 'never'} · failed sign-ins:{' '}
          {data.failedLoginCount}
          {data.statusReason ? ` · reason: ${data.statusReason}` : ''}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500">Roles:</span>
          {assigned.data?.map((role) => (
            <span key={role.roleId} className="inline-flex items-center gap-1">
              <Badge tone="brand">{role.code}</Badge>
              <button
                type="button"
                aria-label={`Remove ${role.code}`}
                className="text-xs text-slate-400 hover:text-negative"
                onClick={() => void run(() => adminApi.revokeRole(userId, role.roleId))}
              >
                ×
              </button>
            </span>
          ))}
          {unassigned.length > 0 ? (
            <select
              value=""
              aria-label="Grant a role"
              onChange={(event) => void run(() => adminApi.grantRole(userId, event.target.value))}
              className="rounded-lg border-0 py-1 pl-2 pr-7 text-xs ring-1 ring-inset ring-slate-300"
            >
              <option value="">Grant a role…</option>
              {unassigned.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.code}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          {data.status === 'SUSPENDED' ? (
            <Button variant="secondary" size="sm" onClick={() => void run(() => adminApi.reactivateUser(userId))}>
              Reactivate
            </Button>
          ) : (
            <>
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Reason for suspending"
                aria-label="Reason for suspending"
                className="rounded-lg border-0 px-3 py-1.5 ring-1 ring-inset ring-slate-300"
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={!reason.trim()}
                onClick={() => void run(() => adminApi.suspendUser(userId, reason))}
              >
                Suspend
              </Button>
            </>
          )}
          <Button variant="secondary" size="sm" onClick={() => void run(() => adminApi.unlockUser(userId))}>
            Unlock
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void run(() => adminApi.signOutUser(userId))}>
            Sign out everywhere
          </Button>
          {confirmErase ? (
            <Button variant="danger" size="sm" onClick={() => void run(() => adminApi.eraseUser(userId))}>
              Yes, erase for good
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirmErase(true)}>
              Erase
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export function UsersPage() {
  const [page, setPage] = useState(0);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [selected, setSelected] = useState<string | null>(null);
  const users = useResource(
    () => adminApi.users({ page, size: 20, email: email.trim() || undefined, status: status || undefined }),
    [page, email, status],
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title={
          <>
            User <span className="text-brand-500">accounts</span>
          </>
        }
        action={<span>{users.data?.totalElements ?? 0} accounts</span>}
      />
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={email}
          onChange={(event) => {
            setPage(0);
            setEmail(event.target.value);
          }}
          placeholder="Email contains…"
          aria-label="Search by email"
          className="w-64 rounded-lg border-0 bg-surface py-2 pl-3 pr-3 text-sm shadow-sm ring-1 ring-inset ring-slate-300"
        />
        <select
          value={status}
          aria-label="Filter by status"
          onChange={(event) => {
            setPage(0);
            setStatus(event.target.value as UserStatus | '');
          }}
          className="rounded-lg border-0 bg-surface py-2 pl-3 pr-8 text-sm shadow-sm ring-1 ring-inset ring-slate-300"
        >
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {option || 'All statuses'}
            </option>
          ))}
        </select>
      </div>
      <Notice>{users.error ? apiErrorMessage(users.error) : ''}</Notice>
      {selected ? <UserPanel key={selected} userId={selected} onChanged={users.reload} /> : null}
      <div className="overflow-x-auto rounded-card border border-slate-200 bg-surface shadow-card">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.data?.content.map((user) => (
              <tr
                key={user.id}
                className="cursor-pointer hover:bg-surface-sunken/60"
                onClick={() => setSelected(selected === user.id ? null : user.id)}
              >
                <td className="px-5 py-3 font-medium text-slate-800">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={user.status === 'ACTIVE' ? 'positive' : 'warning'}>{user.status}</Badge>
                  {user.locked ? (
                    <Badge tone="negative" className="ml-1">
                      Locked
                    </Badge>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-600">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}</td>
                <td className="px-4 py-3 text-slate-600">{formatDateTime(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} totalPages={users.data?.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}
