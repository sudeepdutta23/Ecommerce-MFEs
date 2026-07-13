import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import { Badge, Button, SectionHeader, Spinner, cn } from '@ecom/ui';
import { useCatalogStore } from './CatalogProvider';
import { ProductCard } from './ProductCard';

export const CatalogPage = observer(function CatalogPage() {
  const store = useCatalogStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    void store.loadProducts();
  }, [store]);

  // URL params are the contract between the shell and this MFE: the shell's
  // header search and category pills navigate to /catalog?q=…&category=….
  useEffect(() => {
    const query = searchParams.get('q');
    if (query !== null) {
      store.setQuery(query);
    }
    const category = searchParams.get('category');
    if (category !== null) {
      store.setCategory(store.categories.includes(category) ? category : 'all');
    }
  }, [searchParams, store, store.products.length]);

  if (store.status === 'loading') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" label="Loading products" />
      </div>
    );
  }

  if (store.status === 'error') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-slate-600">Could not load the catalog.</p>
        <Button variant="secondary" onClick={() => void store.loadProducts()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={
          <>
            Grab the best deal on{' '}
            <span className="text-brand-500">
              {store.category === 'all' ? 'Everything' : store.category}
            </span>
          </>
        }
        action={<Badge tone="brand">🛒 {store.cartCount} in cart</Badge>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={store.query}
          onChange={(event) => store.setQuery(event.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-64 rounded-lg border-0 bg-surface-sunken px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {store.categories.map((category) => (
            <button
              key={category}
              onClick={() => store.setCategory(category)}
              className={cn(
                'rounded-full px-4 py-2 text-sm capitalize transition-colors',
                store.category === category
                  ? 'bg-brand-500 font-medium text-white'
                  : 'bg-surface-sunken text-slate-700 hover:bg-brand-50',
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {store.filteredProducts.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {store.filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
});
