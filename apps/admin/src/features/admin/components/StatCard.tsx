import { type ReactNode } from 'react';
import { AnimatedNumber, Card, CardBody } from '@ecom/ui';

export interface StatCardProps {
  label: string;
  value: number;
  /** Formatter for the animated value (e.g. currency). */
  format?: (value: number) => string;
  /** Secondary line under the value. */
  sub?: ReactNode;
}

/** KPI tile: animated headline number over a muted caption. */
export function StatCard({ label, value, format, sub }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-slate-900">
          <AnimatedNumber value={value} format={format} />
        </p>
        {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
      </CardBody>
    </Card>
  );
}
