import { type ReactNode } from 'react';
import { cn } from './cn';

export interface CategoryCircleProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  className?: string;
}

/** Circular category tile with a label, as used in "Shop From Top Categories". */
export function CategoryCircle({ icon, label, active = false, className }: CategoryCircleProps) {
  return (
    <div className={cn('flex w-24 flex-col items-center gap-2 text-center', className)}>
      <div
        className={cn(
          'flex h-24 w-24 items-center justify-center rounded-full bg-surface-sunken text-4xl transition-shadow',
          active
            ? 'ring-2 ring-brand-500 ring-offset-2'
            : 'hover:ring-2 hover:ring-brand-200 hover:ring-offset-2',
        )}
      >
        {icon}
      </div>
      <p className="text-sm text-slate-700">{label}</p>
    </div>
  );
}
