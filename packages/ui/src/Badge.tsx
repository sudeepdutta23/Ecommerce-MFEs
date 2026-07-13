import { type HTMLAttributes } from 'react';
import { cn } from './cn';

type BadgeTone = 'brand' | 'neutral' | 'positive' | 'negative' | 'warning';

const toneClasses: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  neutral: 'bg-slate-50 text-slate-700 ring-slate-200',
  positive: 'bg-green-50 text-positive ring-green-200',
  negative: 'bg-red-50 text-negative ring-red-200',
  warning: 'bg-amber-50 text-warning ring-amber-200',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
      {...rest}
    />
  );
}
