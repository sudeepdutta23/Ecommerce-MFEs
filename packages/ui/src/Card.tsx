import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-slate-200 bg-surface shadow-card transition-shadow duration-300 hover:shadow-card-hover',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn('border-b border-slate-100 px-5 py-4', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: CardProps) {
  return (
    <h3 className={cn('text-base font-semibold text-slate-900', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn('px-5 py-4', className)} {...rest}>
      {children}
    </div>
  );
}
