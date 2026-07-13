import { useEffect } from 'react';
import { eventBus } from '@ecom/utils';
import { useAnalyticsStore } from './analytics.store';

/**
 * Bridges the cross-MFE event bus into this MFE's private Zustand store.
 * This hook is the ONLY inbound integration point of the analytics MFE.
 */
export function useEventBridge(): void {
  const record = useAnalyticsStore((state) => state.record);
  const addCartValue = useAnalyticsStore((state) => state.addCartValue);

  useEffect(() => {
    const unsubscribers = [
      eventBus.on('analytics:track', ({ name, source, payload }) => {
        record({ name, source, payload });
      }),
      eventBus.on('cart:item-added', ({ productId, name, price, currency }) => {
        record({
          name: 'cart_item_added',
          source: 'product-catalog',
          payload: { productId, product: name, price, currency },
        });
        addCartValue(price);
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [record, addCartValue]);
}
