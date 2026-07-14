import { AnimatedNumber, Card, CardBody } from '@ecom/ui';

interface StatTileProps {
  label: string;
  /** Raw numeric value — animated (count-up) whenever it changes. */
  value: number;
  /** Formatter applied on every animation frame (currency, compact, …). */
  format?: (value: number) => string;
  hint?: string;
}

/**
 * Stat tile: label + compact value (+ optional context line).
 * Values wear text tokens, not accent colors — color is reserved for meaning.
 */
export function StatTile({ label, value, format, hint }: StatTileProps) {
  return (
    <Card className="group transition-transform duration-300 ease-out-expo hover:-translate-y-1">
      <CardBody>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">
          <AnimatedNumber value={value} format={format} />
        </p>
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}
