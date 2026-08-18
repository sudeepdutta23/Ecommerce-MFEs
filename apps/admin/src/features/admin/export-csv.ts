import { type Order } from '@ecom/types';
import { effectiveOrderStatus } from '@ecom/utils';

function csvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Client-side CSV download of the given orders (status = what users see). */
export function downloadOrdersCsv(orders: Order[]): void {
  const header = ['order_id', 'placed_at', 'status', 'units', 'subtotal', 'savings', 'currency', 'items'];
  const rows = orders.map((order) => [
    order.id,
    new Date(order.placedAt).toISOString(),
    effectiveOrderStatus(order),
    order.items.reduce((sum, item) => sum + item.quantity, 0),
    order.subtotal,
    order.savings,
    order.currency,
    order.items.map((item) => `${item.name} x${item.quantity}`).join('; '),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvField).join(',')).join('\n');

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sudeepmart-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
