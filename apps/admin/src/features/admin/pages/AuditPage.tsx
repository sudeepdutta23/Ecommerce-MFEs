import { useState } from 'react';
import { Badge, Button, Card, CardBody, SectionHeader } from '@ecom/ui';
import { formatDateTime, formatRelativeTime } from '@ecom/utils';
import { useAdminStore } from '../admin.store';
import { useAdminSession } from '../useAdminSession';
import { ScrollIcon } from '../icons';

/**
 * Audit trail of every action taken in this console (status changes,
 * exports). Stored locally per browser — a real deployment would ship these
 * to an audit service; the shape is already one JSON object per action.
 */
export function AuditPage() {
  const auditLog = useAdminStore((state) => state.auditLog);
  const clearAudit = useAdminStore((state) => state.clearAudit);
  const user = useAdminSession();
  const [confirmingClear, setConfirmingClear] = useState(false);

  const handleClear = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    clearAudit(user?.name ?? 'admin');
    setConfirmingClear(false);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title={
          <>
            Audit <span className="text-brand-500">log</span>
          </>
        }
        action={
          auditLog.length > 0 ? (
            <span className="flex items-center gap-2">
              {confirmingClear ? (
                <Button variant="ghost" size="sm" onClick={() => setConfirmingClear(false)}>
                  Keep log
                </Button>
              ) : null}
              <Button variant={confirmingClear ? 'danger' : 'secondary'} size="sm" onClick={handleClear}>
                {confirmingClear ? 'Confirm clear' : 'Clear log'}
              </Button>
            </span>
          ) : (
            <span>{auditLog.length} entries</span>
          )
        }
      />

      {auditLog.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-14 text-center">
          <ScrollIcon className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">No actions recorded yet</p>
          <p className="text-xs text-slate-500">
            Fulfillment changes and exports are logged here automatically.
          </p>
        </div>
      ) : (
        <Card>
          <CardBody className="px-0 py-0">
            <ol className="divide-y divide-slate-100">
              {auditLog.map((entry) => (
                <li key={entry.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold uppercase text-brand-700">
                    {entry.actor.slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-800">
                      <b className="font-semibold">{entry.actor}</b> — {entry.detail}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500" title={formatDateTime(entry.at)}>
                      {formatRelativeTime(entry.at)}
                    </p>
                  </div>
                  <Badge tone="neutral" className="shrink-0 font-mono">
                    {entry.action}
                  </Badge>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
