import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { CartStore } from './cart.store';

const CartContext = createContext<CartStore | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new CartStore());

  useEffect(() => () => store.dispose(), [store]);

  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

export function useCartStore(): CartStore {
  const store = useContext(CartContext);
  if (!store) {
    throw new Error('useCartStore must be used within a CartProvider');
  }
  return store;
}
