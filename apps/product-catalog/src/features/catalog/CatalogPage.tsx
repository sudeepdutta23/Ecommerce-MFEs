import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import { Badge, Button, SectionHeader, cn } from '@ecom/ui';
import { useCatalogStore } from './CatalogProvider';
import { ProductCard } from './ProductCard';

/** Shimmering placeholder card shown while products load. */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-card border border-slate-200 bg-surface shadow-card">
      <div className="h-36 animate-pulse bg-slate-100" />
      <div className="space-y-3 px-4 py-3">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3.5 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-8 animate-pulse rounded-md bg-slate-100" />
      </div>
    </div>
  );
}

const Pagination = observer(function Pagination() {
  const store = useCatalogStore();
  const { from, to, total } = store.pageRange;

  if (store.totalPages <= 1) return null;

  const goTo = (page: number) => {
    store.setPage(page);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row"
    >
      <p className="text-sm text-slate-500">
        Showing{' '}
        <span className="font-semibold text-slate-700">
          {from}–{to}
        </span>{' '}
        of <span className="font-semibold text-slate-700">{total}</span> products
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => goTo(store.page - 1)}
          disabled={store.page === 1}
          className="rounded-full bg-surface-sunken px-4 py-2 text-sm text-slate-700 transition-all duration-200 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-sunken"
        >
          ‹ Prev
        </button>
        {Array.from({ length: store.totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => goTo(page)}
            aria-label={`Page ${page}`}
            aria-current={page === store.page ? 'page' : undefined}
            className={cn(
              'h-9 w-9 rounded-full text-sm transition-all duration-200 active:scale-95',
              page === store.page
                ? 'scale-105 bg-brand-500 font-semibold text-white shadow-md'
                : 'bg-surface-sunken text-slate-700 hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-sm',
            )}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => goTo(store.page + 1)}
          disabled={store.page === store.totalPages}
          className="rounded-full bg-surface-sunken px-4 py-2 text-sm text-slate-700 transition-all duration-200 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-sunken"
        >
          Next ›
        </button>
      </div>
    </nav>
  );
});

export const CatalogPage = observer(function CatalogPage() {
  const store = useCatalogStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    void store.ensureProductsLoaded();
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
      <div className="animate-fade-in space-y-6">
        <div className="h-8 w-72 animate-pulse rounded bg-slate-100" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (store.status === 'error') {
    return (
      <div className="flex min-h-[40vh] animate-fade-in-up flex-col items-center justify-center gap-3">
        <span className="animate-wiggle text-4xl" aria-hidden>
          ⚠️
        </span>
        <p className="text-slate-600">Could not load the catalog.</p>
        <Button variant="secondary" onClick={() => void store.loadProducts()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <SectionHeader
          title={
            <>
              Grab the best deal on{' '}
              <span className="text-brand-500">
                {store.category === 'all' ? 'Everything' : store.category}
              </span>
            </>
          }
          action={
            <Badge tone="brand" className={cn(store.cartCount > 0 && 'animate-pop')} key={store.cartCount}>
              🛒 {store.cartCount} in cart
            </Badge>
          }
        />
      </div>

      <div className="flex animate-fade-in flex-wrap items-center gap-3" style={{ animationDelay: '100ms' }}>
        <input
          type="search"
          value={store.query}
          onChange={(event) => store.setQuery(event.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-64 rounded-lg border-0 bg-surface-sunken px-4 py-2.5 text-sm text-slate-700 transition-all duration-300 placeholder:text-slate-400 focus:w-80 focus:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {store.categories.map((category) => (
            <button
              key={category}
              onClick={() => store.setCategory(category)}
              className={cn(
                'rounded-full px-4 py-2 text-sm capitalize transition-all duration-200 ease-out active:scale-95',
                store.category === category
                  ? 'scale-105 bg-brand-500 font-medium text-white shadow-md'
                  : 'bg-surface-sunken text-slate-700 hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-sm',
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {store.filteredProducts.length === 0 ? (
        <div className="animate-fade-in-up py-12 text-center">
          <span className="mb-3 inline-block animate-float text-5xl" aria-hidden>
            🔍
          </span>
          <p className="text-sm text-slate-500">No products match your search.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => {
              store.setQuery('');
              store.setCategory('all');
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {store.pagedProducts.map((product, i) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 60, 480)}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <Pagination />
        </>
      )}
    </div>
  );
});
