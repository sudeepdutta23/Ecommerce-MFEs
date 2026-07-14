import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { OrdersStore } from './orders.store';

const OrdersContext = createContext<OrdersStore | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new OrdersStore());

  useEffect(() => () => store.dispose(), [store]);

  return <OrdersContext.Provider value={store}>{children}</OrdersContext.Provider>;
}

export function useOrdersStore(): OrdersStore {
  const store = useContext(OrdersContext);
  if (!store) {
    throw new Error('useOrdersStore must be used within an OrdersProvider');
  }
  return store;
}
