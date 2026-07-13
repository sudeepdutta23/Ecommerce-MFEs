import { Card, CardBody } from '@ecom/ui';

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
}

/**
 * Stat tile: label + compact value (+ optional context line).
 * Values wear text tokens, not accent colors — color is reserved for meaning.
 */
export function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}
