import { createContext, useContext, useState, type ReactNode } from 'react';
import { CatalogStore } from './catalog.store';

const CatalogContext = createContext<CatalogStore | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new CatalogStore());
  return <CatalogContext.Provider value={store}>{children}</CatalogContext.Provider>;
}

export function useCatalogStore(): CatalogStore {
  const store = useContext(CatalogContext);
  if (!store) {
    throw new Error('useCatalogStore must be used within a CatalogProvider');
  }
  return store;
}
