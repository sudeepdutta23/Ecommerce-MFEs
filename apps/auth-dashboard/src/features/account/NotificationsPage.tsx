import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, CardBody, Notice, Pager, Spinner, useResource } from '@ecom/ui';
import { apiErrorMessage, eventBus, formatRelativeTime, notificationsApi, type NotificationPreferences } from '@ecom/utils';

export function NotificationsPage() {
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const inbox = useResource(() => notificationsApi.list({ page, size: 20, unreadOnly }), [page, unreadOnly]);
  const preferences = useResource(() => notificationsApi.preferences(), []);
  const [settings, setSettings] = useState<NotificationPreferences>();
  const [error, setError] = useState('');

  useEffect(() => {
    if (preferences.data) setSettings(preferences.data);
  }, [preferences.data]);

  const run = async (call: () => Promise<unknown>, reload: () => Promise<void>) => {
    setError('');
    try {
      await call();
      await reload();
      eventBus.emit('analytics:track', { name: 'notifications_changed', source: 'auth-dashboard' });
    } catch (failure) {
      setError(apiErrorMessage(failure));
    }
  };

  /** The box flips at once; the reload puts it back if the server refused. */
  const toggle = (name: keyof NotificationPreferences, value: boolean) => {
    if (!settings) return;
    const next = { ...settings, [name]: value };
    setSettings(next);
    void run(() => notificationsApi.updatePreferences(next), preferences.reload);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => {
                setPage(0);
                setUnreadOnly(event.target.checked);
              }}
            />
            Unread only
          </label>
          <Button variant="secondary" size="sm" onClick={() => void run(() => notificationsApi.markAllRead(), inbox.reload)}>
            Mark all as read
          </Button>
        </div>
      </div>
      <Notice>{inbox.error ? apiErrorMessage(inbox.error) : error}</Notice>
      {inbox.loading && !inbox.data ? <Spinner /> : null}
      {inbox.data?.content.length === 0 ? <p className="text-sm text-slate-500">Nothing here.</p> : null}
      <ul className="space-y-2">
        {inbox.data?.content.map((notification) => (
          <li key={notification.id}>
            <Card>
              <CardBody className="flex items-start justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold text-slate-900">
                    {notification.title}
                    {notification.read ? null : <Badge tone="brand">New</Badge>}
                  </p>
                  <p className="text-slate-600">{notification.body}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatRelativeTime(notification.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Link
                    to={notification.link}
                    onClick={() => void notificationsApi.markRead(notification.id)}
                    className="text-sm font-semibold text-brand-600"
                  >
                    Open
                  </Link>
                  {notification.read ? null : (
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-slate-900"
                      onClick={() => void run(() => notificationsApi.markRead(notification.id), inbox.reload)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
      <Pager page={page} totalPages={inbox.data?.totalPages ?? 1} onPage={setPage} />

      <Card>
        <CardBody className="space-y-2 px-6 py-6 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Email me about</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={!settings}
              checked={settings?.orderUpdatesEmail ?? false}
              onChange={(event) => toggle('orderUpdatesEmail', event.target.checked)}
            />
            Updates on my orders
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={!settings}
              checked={settings?.sellerOrdersEmail ?? false}
              onChange={(event) => toggle('sellerOrdersEmail', event.target.checked)}
            />
            New orders for my shops
          </label>
          <p className="text-xs text-slate-400">Security emails cannot be switched off.</p>
        </CardBody>
      </Card>
    </div>
  );
}
