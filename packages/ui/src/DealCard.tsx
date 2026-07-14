import { type ReactNode } from 'react';
import { cn } from './cn';

export interface DealCardProps {
  name: string;
  price: number;
  /** Strike-through list price; enables the % OFF badge and savings line. */
  mrp?: number;
  currency?: string;
  /** Product visual (image, emoji, illustration). */
  media: ReactNode;
  /** Optional action area below the savings line (e.g. an Add-to-cart button). */
  footer?: ReactNode;
  /**
   * Optional stretched link making the whole card navigable, e.g.
   * `<Link to={…} className="absolute inset-0 z-[5]" aria-label={…} />`.
   * The footer sits above it (z-10) so its actions stay clickable.
   */
  stretchedLink?: ReactNode;
  className?: string;
}

function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Storefront product card: media, name, price vs MRP, corner discount badge,
 * and a green savings line. Purely presentational — the caller owns data
 * fetching and actions.
 */
export function DealCard({
  name,
  price,
  mrp,
  currency = 'INR',
  media,
  footer,
  stretchedLink,
  className,
}: DealCardProps) {
  const hasDiscount = mrp !== undefined && mrp > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / mrp) * 100) : 0;

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card',
        'transition-all duration-300 ease-out-expo hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-card-hover',
        className,
      )}
    >
      {hasDiscount ? (
        <span className="absolute right-0 top-0 z-10 rounded-bl-xl bg-brand-500 px-2.5 py-1.5 text-center text-xs font-semibold leading-tight text-white transition-colors duration-300 group-hover:bg-brand-600">
          {discountPercent}%
          <br />
          OFF
        </span>
      ) : null}

      <div className="flex h-36 items-center justify-center overflow-hidden bg-surface-sunken text-6xl">
        <span className="flex h-full w-full items-center justify-center transition-transform duration-500 ease-spring group-hover:scale-110">
          {media}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 py-3">
        <h3 className="line-clamp-2 text-sm font-medium text-slate-900">{name}</h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-slate-900">
            {formatPrice(price, currency)}
          </span>
          {hasDiscount ? (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(mrp, currency)}
            </span>
          ) : null}
        </div>

        {hasDiscount ? (
          <>
            <div className="my-2 border-t border-slate-100" />
            <p className="text-sm font-medium text-positive">
              Save - {formatPrice(mrp - price, currency)}
            </p>
          </>
        ) : null}

        {footer ? <div className="relative z-10 mt-auto pt-3">{footer}</div> : null}
      </div>

      {stretchedLink}
    </div>
  );
}
