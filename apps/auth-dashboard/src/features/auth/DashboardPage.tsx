import { Navigate } from 'react-router-dom';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle } from '@ecom/ui';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from './auth.slice';

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="login" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            This dashboard is the auth-dashboard MFE — state lives in its own Redux Toolkit store.
          </p>
        </div>
        <Button variant="secondary" onClick={() => dispatch(logout())}>
          Sign out
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-slate-600">
            <p>
              Signing in emitted <code className="font-mono text-xs">auth:login</code> on the event
              bus — the shell header and the analytics MFE both reacted without sharing a store.
            </p>
            <Badge tone="positive">Session active</Badge>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
