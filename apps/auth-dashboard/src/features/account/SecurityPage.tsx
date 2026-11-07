import { useState, type FormEvent } from 'react';
import { Badge, Button, Card, CardBody, Notice, Spinner, TextInput, useResource } from '@ecom/ui';
import { apiErrorMessage, authApi, endLocalSession, formatDateTime, formatRelativeTime, storeAccessToken } from '@ecom/utils';

export function SecurityPage() {
  const sessions = useResource(() => authApi.sessions(), []);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const { accessToken } = await authApi.changePassword(current, next);
      storeAccessToken(accessToken);
      setCurrent('');
      setNext('');
      setMessage('Password changed. Your other devices were signed out.');
      await sessions.reload();
    } catch (failure) {
      setError(apiErrorMessage(failure, 'Could not change your password.'));
    }
  };

  const revoke = async (sessionId: string) => {
    setError('');
    try {
      await authApi.revokeSession(sessionId);
      await sessions.reload();
    } catch (failure) {
      setError(apiErrorMessage(failure, 'Could not end that session.'));
    }
  };

  const logoutEverywhere = async () => {
    setError('');
    try {
      await authApi.logoutAll();
      endLocalSession();
    } catch (failure) {
      setError(apiErrorMessage(failure, 'Could not sign out everywhere.'));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Notice>{error}</Notice>
      <Notice tone="success">{message}</Notice>

      <Card>
        <CardBody className="space-y-4 px-6 py-6">
          <h1 className="text-xl font-bold text-slate-900">Change password</h1>
          <form onSubmit={(event) => void changePassword(event)} className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              required
            />
            <TextInput
              label="New password"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              required
            />
            <p className="text-xs text-slate-400 sm:col-span-2">
              At least 12 characters, not your email and not a common password.
            </p>
            <div>
              <Button type="submit">Change password</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4 px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Signed-in devices</h2>
            <Button variant="danger" size="sm" onClick={() => void logoutEverywhere()}>
              Sign out everywhere
            </Button>
          </div>
          {sessions.loading && !sessions.data ? <Spinner /> : null}
          <Notice>{sessions.error ? apiErrorMessage(sessions.error) : ''}</Notice>
          <ul className="divide-y divide-slate-100 text-sm">
            {sessions.data?.map((session) => (
              <li key={session.sessionId} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-slate-900">{session.userAgent ?? 'Unknown device'}</p>
                  <p className="text-xs text-slate-500" title={formatDateTime(session.startedAt)}>
                    {session.ip ?? 'Unknown address'} · active {formatRelativeTime(session.lastActiveAt)}
                  </p>
                </div>
                {session.current ? (
                  <Badge tone="positive">This device</Badge>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => void revoke(session.sessionId)}>
                    Sign out
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
