import { Link } from 'react-router-dom';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Reveal, useResource } from '@ecom/ui';
import { authApi, formatDateTime, notificationsApi } from '@ecom/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from './auth.slice';

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const me = useResource(() => authApi.me(), []);
  const unread = useResource(() => notificationsApi.unreadCount(), []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 px-6 py-6 text-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 animate-scale-in items-center justify-center rounded-full bg-white/15 text-lg font-bold backdrop-blur-sm">
              {initialsOf(user.name)}
            </span>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
              <p className="mt-0.5 text-sm text-white/80">{user.email}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => void dispatch(logout())} className="!ring-0 hover:!bg-white/90">
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Reveal delay={100}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <Badge tone="positive">{me.data?.status ?? '…'}</Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Roles</dt>
                  <dd className="flex flex-wrap justify-end gap-1">
                    {(me.data?.roles ?? []).map((role) => (
                      <Badge key={role} tone="brand">
                        {role}
                      </Badge>
                    ))}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Last sign-in</dt>
                  <dd className="text-slate-900">
                    {me.data?.lastLoginAt ? formatDateTime(me.data.lastLoginAt) : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Member since</dt>
                  <dd className="text-slate-900">{me.data ? formatDateTime(me.data.createdAt) : '—'}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </Reveal>

        <Reveal delay={200}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm text-slate-600">
              <p>
                You have <b className="font-semibold text-slate-900">{unread.data?.unread ?? 0}</b> unread notifications.
              </p>
              <Link to="notifications">
                <Button variant="secondary" size="sm">
                  Open inbox
                </Button>
              </Link>
            </CardBody>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
