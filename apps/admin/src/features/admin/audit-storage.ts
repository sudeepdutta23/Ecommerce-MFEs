/**
 * Persistent audit trail of admin actions.
 *
 * PRIVATE to the admin MFE (not a cross-MFE contract): only this console
 * writes or reads it. Capped so localStorage can't grow unbounded.
 */

const AUDIT_KEY = 'ecom.admin.audit';
const MAX_ENTRIES = 200;

export interface AuditEntry {
  id: string;
  /** Epoch ms when the action happened. */
  at: number;
  /** Display name of the admin who performed the action. */
  actor: string;
  /** Machine-readable action kind, e.g. 'order:status-changed'. */
  action: string;
  /** Human-readable summary shown in the log. */
  detail: string;
}

export function getAuditLog(): AuditEntry[] {
  const raw = localStorage.getItem(AUDIT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AuditEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(AUDIT_KEY);
    return [];
  }
}

/** Persist a new entry (newest first). Returns the updated log. */
export function appendAudit(input: Omit<AuditEntry, 'id' | 'at'>): AuditEntry[] {
  const entry: AuditEntry = { ...input, id: crypto.randomUUID(), at: Date.now() };
  const log = [entry, ...getAuditLog()].slice(0, MAX_ENTRIES);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
  return log;
}

export function clearAuditLog(): void {
  localStorage.removeItem(AUDIT_KEY);
}
