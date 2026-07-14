import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, SectionHeader } from '@ecom/ui';
import { eventBus } from '@ecom/utils';
import { useCatalogStore } from './CatalogProvider';
import { AddToCartButton } from './AddToCartButton';
import { ProductCard } from './ProductCard';
import { ProductGallery } from './ProductGallery';

function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function RatingStars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="text-lg leading-none text-amber-400">
        {'★'.repeat(filled)}
        <span className="text-slate-200">{'★'.repeat(5 - filled)}</span>
      </span>
      <span className="text-sm font-medium text-slate-600">{rating.toFixed(1)} rating</span>
    </span>
  );
}

const PERKS = [
  { icon: '🚚', title: 'Free Delivery', detail: 'On orders above ₹499' },
  { icon: '↩️', title: '7-Day Replacement', detail: 'Hassle-free returns' },
  { icon: '🛡️', title: 'Genuine Product', detail: 'Direct from brand' },
];

export const ProductOverviewPage = observer(function ProductOverviewPage() {
  const store = useCatalogStore();
  const { productId = '' } = useParams();
  const product = store.productById(productId);
  const viewedProductId = product?.id;

  useEffect(() => {
    void store.ensureProductsLoaded();
  }, [store]);

  // Redundant under the shell (its router scrolls on navigation) but keeps
  // standalone dev behaving the same.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [productId]);

  useEffect(() => {
    if (viewedProductId !== undefined) {
      eventBus.emit('analytics:track', {
        name: 'view_product',
        source: 'product-catalog',
        payload: { productId: viewedProductId },
      });
    }
  }, [viewedProductId]);

  if (store.status === 'loading') {
    return (
      <div className="grid animate-fade-in gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-[4/3] animate-pulse rounded-card bg-slate-100" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-16 w-20 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="h-12 w-48 animate-pulse rounded bg-slate-100" />
          <div className="h-28 animate-pulse rounded bg-slate-100" />
          <div className="h-12 w-56 animate-pulse rounded bg-slate-100" />
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
        <p className="text-slate-600">Could not load this product.</p>
        <Button variant="secondary" onClick={() => void store.loadProducts()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[40vh] animate-fade-in-up flex-col items-center justify-center gap-3">
        <span className="animate-float text-5xl" aria-hidden>
          🔍
        </span>
        <p className="text-slate-600">We couldn&apos;t find that product.</p>
        <Link to=".." className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  const hasDiscount = product.mrp !== undefined && product.mrp > product.price;
  const specEntries = Object.entries(product.specs ?? {});
  const relatedProducts = store.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div key={product.id} className="space-y-12">
      <nav aria-label="Breadcrumb" className="animate-fade-in-down text-sm text-slate-500">
        <Link to=".." className="transition-colors hover:text-brand-600">
          Catalog
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <Link
          to={{ pathname: '..', search: `?category=${encodeURIComponent(product.category)}` }}
          className="transition-colors hover:text-brand-600"
        >
          {product.category}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="font-medium text-slate-900">{product.name}</span>
      </nav>

      <div className="grid animate-fade-in-up items-start gap-10 lg:grid-cols-2">
        <ProductGallery key={product.id} product={product} />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{product.category}</Badge>
            {product.inStock ? (
              <Badge tone="positive">In stock</Badge>
            ) : (
              <Badge tone="negative">Out of stock</Badge>
            )}
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>
            <RatingStars rating={product.rating} />
          </div>

          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-bold text-slate-900 sm:text-5xl">
                {formatPrice(product.price, product.currency)}
              </span>
              {hasDiscount ? (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    {formatPrice(product.mrp!, product.currency)}
                  </span>
                  <Badge tone="positive">
                    {Math.round((1 - product.price / product.mrp!) * 100)}% OFF
                  </Badge>
                </>
              ) : null}
            </div>
            {hasDiscount ? (
              <p className="mt-2 text-sm font-medium text-positive">
                You save {formatPrice(product.mrp! - product.price, product.currency)} · Inclusive
                of all taxes
              </p>
            ) : null}
          </div>

          <p className="text-base leading-relaxed text-slate-600">{product.description}</p>

          {product.highlights?.length ? (
            <div className="space-y-2.5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                Highlights
              </h2>
              <ul className="space-y-2">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span aria-hidden className="mt-0.5 font-bold text-positive">
                      ✓
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="border-t border-slate-100 pt-6">
            {product.inStock ? (
              <AddToCartButton product={product} size="lg" className="w-full sm:w-auto sm:px-12" />
            ) : (
              <p className="text-sm text-slate-500">
                This item is currently unavailable. Check back soon.
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
            {PERKS.map((perk) => (
              <div key={perk.title} className="text-center">
                <span aria-hidden className="text-2xl">
                  {perk.icon}
                </span>
                <p className="mt-1.5 text-xs font-semibold text-slate-900">{perk.title}</p>
                <p className="text-xs text-slate-500">{perk.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {specEntries.length > 0 ? (
        <section className="animate-fade-in-up space-y-6" aria-label="Specifications">
          <SectionHeader
            title={
              <>
                Product <span className="text-brand-500">Specifications</span>
              </>
            }
          />
          <dl className="grid gap-x-12 gap-y-4 rounded-card border border-slate-200 bg-surface p-6 shadow-card sm:grid-cols-2">
            {specEntries.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[9rem_1fr] gap-4 border-b border-slate-100 pb-3 text-sm last:border-b-0"
              >
                <dt className="font-medium text-slate-500">{label}</dt>
                <dd className="text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {relatedProducts.length > 0 ? (
        <section
          className="animate-fade-in-up space-y-6"
          style={{ animationDelay: '150ms' }}
          aria-label="Related products"
        >
          <SectionHeader
            title={
              <>
                More in <span className="text-brand-500">{product.category}</span>
              </>
            }
            action={
              <Link
                to={{ pathname: '..', search: `?category=${encodeURIComponent(product.category)}` }}
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                View all ›
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} to={`../${related.id}`} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
});
