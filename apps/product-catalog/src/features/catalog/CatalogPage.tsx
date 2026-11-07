import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import { type StorefrontSort } from '@ecom/utils';
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

/** At most seven numbered buttons around the current page: a large catalogue has thousands of pages. */
function pageNumbers(current: number, total: number): number[] {
  const first = Math.max(1, Math.min(current - 3, total - 6));
  return Array.from({ length: Math.min(7, total) }, (_, i) => first + i);
}

const SORT_OPTIONS: Array<{ value: StorefrontSort | ''; label: string }> = [
  { value: '', label: 'Best match' },
  { value: 'NEWEST', label: 'Newest' },
  { value: 'PRICE_ASC', label: 'Price: low to high' },
  { value: 'PRICE_DESC', label: 'Price: high to low' },
];

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
        {pageNumbers(store.page, store.totalPages).map((page) => (
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
    void store.loadCategories();
  }, [store]);

  // URL params are the contract between the shell and this MFE: the shell's
  // header search and category pills navigate to /catalog?q=…&category=<slug>.
  useEffect(() => {
    store.applyUrlFilters(searchParams.get('q'), searchParams.get('category'));
  }, [searchParams, store]);

  if (store.status === 'loading' && store.products.length === 0) {
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
        <p className="text-slate-600">{store.errorMessage}</p>
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
              <span className="text-brand-500">{store.categoryName}</span>
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
          {[{ slug: 'all', name: 'All' }, ...store.categories].map((category) => (
            <button
              key={category.slug}
              onClick={() => store.setCategory(category.slug)}
              className={cn(
                'rounded-full px-4 py-2 text-sm capitalize transition-all duration-200 ease-out active:scale-95',
                store.category === category.slug
                  ? 'scale-105 bg-brand-500 font-medium text-white shadow-md'
                  : 'bg-surface-sunken text-slate-700 hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-sm',
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <select
          value={store.sort}
          onChange={(event) => store.setSort(event.target.value as StorefrontSort | '')}
          aria-label="Sort products"
          className="rounded-lg border-0 bg-surface-sunken px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          value={store.minPrice}
          onChange={(event) => store.setPriceRange(event.target.value, store.maxPrice)}
          placeholder="Min price"
          aria-label="Lowest price"
          className="w-28 rounded-lg border-0 bg-surface-sunken px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={store.maxPrice}
          onChange={(event) => store.setPriceRange(store.minPrice, event.target.value)}
          placeholder="Max price"
          aria-label="Highest price"
          className="w-28 rounded-lg border-0 bg-surface-sunken px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={store.inStockOnly}
            onChange={(event) => store.setInStockOnly(event.target.checked)}
          />
          In stock only
        </label>
      </div>

      {store.cartError ? (
        <p role="alert" className="text-sm text-negative">
          {store.cartError}
        </p>
      ) : null}

      {store.products.length === 0 ? (
        <div className="animate-fade-in-up py-12 text-center">
          <span className="mb-3 inline-block animate-float text-5xl" aria-hidden>
            🔍
          </span>
          <p className="text-sm text-slate-500">No products match your search.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => store.clearFilters()}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {store.products.map((product, i) => (
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
