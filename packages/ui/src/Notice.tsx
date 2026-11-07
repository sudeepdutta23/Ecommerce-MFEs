import { type ReactNode } from 'react';
import { Button } from './Button';
import { cn } from './cn';

const TONES = {
  error: 'bg-red-50 text-negative',
  success: 'bg-emerald-50 text-emerald-800',
  info: 'bg-brand-50 text-brand-800',
  warning: 'bg-amber-50 text-amber-900',
};

/** A one-line message above a form or list. Renders nothing without content. */
export function Notice({ tone = 'error', children }: { tone?: keyof typeof TONES; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-lg px-4 py-3 text-sm', TONES[tone])}>
      {children}
    </p>
  );
}

/** Previous and next for a zero-based page, the backend's convention. */
export function Pager({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between text-sm text-slate-600">
      <span>
        Page {page + 1} of {totalPages}
      </span>
      <span className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </span>
    </nav>
  );
}
