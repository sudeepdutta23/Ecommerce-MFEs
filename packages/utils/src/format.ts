/** Locale-aware formatting helpers shared across MFEs. */

export function formatCurrency(amount: number, currency = 'INR', locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

export function formatDateTime(timestamp: number, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function formatRelativeTime(timestamp: number, locale = 'en-US'): string {
  const deltaSeconds = Math.round((timestamp - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [unit, secondsPerUnit] of ranges) {
    if (Math.abs(deltaSeconds) >= secondsPerUnit || unit === 'second') {
      return rtf.format(Math.trunc(deltaSeconds / secondsPerUnit), unit);
    }
  }
  return rtf.format(deltaSeconds, 'second');
}
