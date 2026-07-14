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
    <div className={cn('group flex w-24 flex-col items-center gap-2 text-center', className)}>
      <div
        className={cn(
          'flex h-24 w-24 items-center justify-center rounded-full bg-surface-sunken text-4xl',
          'transition-all duration-300 ease-spring group-hover:-translate-y-1.5 group-hover:bg-brand-50 group-hover:shadow-glow',
          active
            ? 'ring-2 ring-brand-500 ring-offset-2'
            : 'group-hover:ring-2 group-hover:ring-brand-300 group-hover:ring-offset-2',
        )}
      >
        <span className="transition-transform duration-300 ease-spring group-hover:scale-110">
          {icon}
        </span>
      </div>
      <p className="text-sm text-slate-700 transition-colors duration-200 group-hover:font-medium group-hover:text-brand-600">
        {label}
      </p>
    </div>
  );
}
