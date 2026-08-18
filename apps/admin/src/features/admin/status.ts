import { type OrderStatus } from '@ecom/types';
import { ORDER_STATUS_FLOW, orderStatusRank } from '@ecom/utils';

/** Presentation mapping for the shared fulfillment pipeline. */

export const STATUS_LABEL: Record<OrderStatus, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

export const STATUS_TONE: Record<OrderStatus, 'warning' | 'brand' | 'positive'> = {
  processing: 'warning',
  shipped: 'brand',
  delivered: 'positive',
};

/** Fill colors for the fulfillment pipeline bar (match Badge tones). */
export const STATUS_BAR_CLASS: Record<OrderStatus, string> = {
  processing: 'bg-amber-400',
  shipped: 'bg-brand-500',
  delivered: 'bg-positive',
};

/** Next stage in the pipeline, or null once delivered. */
export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  return ORDER_STATUS_FLOW[orderStatusRank(status) + 1] ?? null;
}

export const ADVANCE_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  processing: 'Mark shipped',
  shipped: 'Mark delivered',
};
