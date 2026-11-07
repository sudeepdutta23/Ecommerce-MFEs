import { type OrderStatus } from '@ecom/types';

export const STATUS_META: Record<
  OrderStatus,
  { label: string; tone: 'warning' | 'brand' | 'positive' | 'negative'; icon: string }
> = {
  PENDING_PAYMENT: { label: 'Awaiting payment', tone: 'warning', icon: '💳' },
  PAID: { label: 'Paid, preparing', tone: 'brand', icon: '⏳' },
  SHIPPED: { label: 'Shipped', tone: 'brand', icon: '🚚' },
  DELIVERED: { label: 'Delivered', tone: 'positive', icon: '✅' },
  CANCELLED: { label: 'Cancelled', tone: 'negative', icon: '✕' },
};
