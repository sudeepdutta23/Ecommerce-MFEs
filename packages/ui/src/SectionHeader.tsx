import { type ReactNode } from 'react';
import { cn } from './cn';

export interface SectionHeaderProps {
  /** Section title; highlight words with `<span className="text-brand-500">…</span>`. */
  title: ReactNode;
  /** Right-aligned action, e.g. a "View All ›" link. */
  action?: ReactNode;
  className?: string;
}

/** Storefront section heading: title with a brand underline over a full-width divider. */
export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between border-b border-slate-200', className)}>
      <h2 className="-mb-px border-b-[3px] border-brand-500 pb-3 text-xl font-semibold text-slate-900">
        {title}
      </h2>
      {action ? <div className="pb-3 text-sm text-slate-500">{action}</div> : null}
    </div>
  );
}
