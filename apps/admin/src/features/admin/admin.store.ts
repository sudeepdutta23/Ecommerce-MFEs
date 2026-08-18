import { useEffect } from 'react';
import { create } from 'zustand';
import { type Order } from '@ecom/types';
import { effectiveOrderStatus, eventBus, getOrders, updateOrderStatus } from '@ecom/utils';
import { appendAudit, clearAuditLog, getAuditLog, type AuditEntry } from './audit-storage';
import { nextOrderStatus } from './status';

/**
 * Zustand store PRIVATE to the admin MFE.
 *
 * Orders come exclusively through the shared order-storage contract; every
 * mutation goes back through it and is broadcast on the event bus
 * (`order:updated`) so customer-facing MFEs stay in sync. Each mutation is
 * also written to the audit trail and mirrored to `analytics:track`.
 */

interface AdminState {
  orders: Order[];
  auditLog: AuditEntry[];
  /** Re-hydrate orders from storage (order:placed, cross-tab writes). */
  refresh: () => void;
  /** Record an admin action in the audit trail and the analytics stream. */
  logAction: (actor: string, action: string, detail: string) => void;
  /** Advance one order to the next fulfillment stage and broadcast it. */
  advanceOrder: (orderId: string, actor: string) => void;
  clearAudit: (actor: string) => void;
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  orders: getOrders(),
  auditLog: getAuditLog(),

  refresh: () => set({ orders: getOrders() }),

  logAction: (actor, action, detail) => {
    set({ auditLog: appendAudit({ actor, action, detail }) });
    eventBus.emit('analytics:track', { name: action, source: 'admin', payload: { detail } });
  },

  advanceOrder: (orderId, actor) => {
    const order = get().orders.find((entry) => entry.id === orderId);
    if (!order) return;
    // Advance from the EFFECTIVE status (what users currently see), so the
    // action never appears to move an order backwards.
    const next = nextOrderStatus(effectiveOrderStatus(order));
    if (!next || !updateOrderStatus(orderId, next)) return;
    set({ orders: getOrders() });
    get().logAction(actor, 'order:status-changed', `${orderId} → ${next}`);
    eventBus.emit('order:updated', { orderId, status: next });
  },

  clearAudit: (actor) => {
    clearAuditLog();
    set({ auditLog: [] });
    eventBus.emit('analytics:track', {
      name: 'audit:cleared',
      source: 'admin',
      payload: { actor },
    });
  },
}));

/**
 * Keeps the store in sync while the console is mounted: checkouts elsewhere
 * in the app arrive via `order:placed`; edits from another tab arrive via
 * the browser's cross-tab `storage` event.
 */
export function useOrdersSync(): void {
  const refresh = useAdminStore((state) => state.refresh);

  useEffect(() => {
    const offPlaced = eventBus.on('order:placed', refresh);
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => {
      offPlaced();
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);
}
