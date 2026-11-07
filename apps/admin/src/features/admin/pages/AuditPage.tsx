import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Notice, SectionHeader, Spinner } from '@ecom/ui';
import { adminApi, apiErrorMessage, formatDateTime, formatRelativeTime, type AuditEvent } from '@ecom/utils';
import { ScrollIcon } from '../icons';

const PAGE_SIZE = 30;

/**
 * The backend's audit log, newest first, with cursor paging. It is append-only by design: an
 * administrator can read it but not change or clear it, so it can be trusted after an incident.
 */
export function AuditPage() {
  const [action, setAction] = useState('');
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (before?: string) => {
    setLoading(true);
    setError('');
    try {
      const page = await adminApi.audit({ action: action.trim() || undefined, before, size: PAGE_SIZE });
      setEvents((current) => (before ? [...current, ...page.items] : page.items));
      setNextBefore(page.nextBefore ?? null);
    } catch (failure) {
      setError(apiErrorMessage(failure, 'Could not load the audit log.'));
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reloads only when applied, not per keystroke
  }, []);

  return (
    <div className="space-y-5">
      <SectionHeader
        title={
          <>
            Audit <span className="text-brand-500">log</span>
          </>
        }
      />
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
      >
        <input
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder="Action, e.g. org.suspend"
          aria-label="Filter by action"
          className="w-72 rounded-lg border-0 bg-surface py-2 pl-3 text-sm shadow-sm ring-1 ring-inset ring-slate-300"
        />
        <Button type="submit" variant="secondary" size="sm">
          Filter
        </Button>
      </form>
      <Notice>{error}</Notice>
      {!loading && events.length === 0 && !error ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-14 text-center">
          <ScrollIcon className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">No actions recorded</p>
        </div>
      ) : null}
      {events.length > 0 ? (
        <Card>
          <CardBody className="px-0 py-0">
            <ol className="divide-y divide-slate-100">
              {events.map((event) => (
                <li key={event.id} className="flex items-center gap-4 px-5 py-3.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-slate-800">
                      {event.targetType ? `${event.targetType} ` : ''}
                      <span className="font-mono text-xs text-slate-500">{event.targetId ?? ''}</span>
                    </p>
                    {event.detail ? <p className="truncate text-xs text-slate-500">{event.detail}</p> : null}
                    <p className="mt-0.5 text-xs text-slate-500" title={formatDateTime(event.occurredAt)}>
                      {formatRelativeTime(event.occurredAt)}
                      {event.clientIp ? ` · ${event.clientIp}` : ''}
                      {event.actorId ? ` · by ${event.actorId.slice(0, 8)}` : ''}
                    </p>
                  </div>
                  <Badge tone="neutral" className="shrink-0 font-mono">
                    {event.action}
                  </Badge>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      ) : null}
      {loading ? <Spinner /> : null}
      {nextBefore && !loading ? (
        <Button variant="secondary" size="sm" onClick={() => void load(nextBefore)}>
          Load older
        </Button>
      ) : null}
    </div>
  );
}
