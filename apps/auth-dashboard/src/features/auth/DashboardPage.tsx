import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, Reveal } from '@ecom/ui';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout, syncSession } from './auth.slice';

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

  // Revalidate the persisted session against GET /auth/me (the interceptor
  // refreshes an expired access token transparently).
  useEffect(() => {
    void dispatch(syncSession());
  }, [dispatch]);

  if (!user) {
    return <Navigate to="login" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Gradient welcome banner */}
      <div className="animate-fade-in-down overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 px-6 py-6 text-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 animate-scale-in items-center justify-center rounded-full bg-white/15 text-lg font-bold backdrop-blur-sm">
              {initialsOf(user.name)}
            </span>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
              <p className="mt-0.5 text-sm text-white/80">
                This dashboard is the auth-dashboard MFE — state lives in its own Redux Toolkit
                store.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => dispatch(logout())}
            className="!ring-0 hover:!bg-white/90"
          >
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Reveal delay={100}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Name</dt>
                  <dd className="font-medium text-slate-900">{user.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium text-slate-900">{user.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Role</dt>
                  <dd>
                    <Badge tone="brand">{user.role}</Badge>
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </Reveal>

        <Reveal delay={200}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Session</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm text-slate-600">
              <p>
                Signed in against the auth-service via the gateway. Signing in emitted{' '}
                <code className="font-mono text-xs">auth:login</code> on the event bus — the shell
                header and the analytics MFE both reacted without sharing a store. Signing out
                revokes the refresh token server-side.
              </p>
              <Badge tone="positive" className="animate-pulse-ring">
                Session active
              </Badge>
            </CardBody>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
