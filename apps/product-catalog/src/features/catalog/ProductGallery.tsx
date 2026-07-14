import { useState } from 'react';
import { type Product } from '@ecom/types';
import { ImageWithFallback, cn } from '@ecom/ui';
import { productEmojiFor } from './product-media';

/**
 * Sliding image gallery for the overview page: main viewport with arrow/dot
 * navigation plus a thumbnail strip. Mount with `key={product.id}` so the
 * slide index resets when navigating between products.
 */
export function ProductGallery({ product }: { product: Product }) {
  const images = product.images?.length
    ? product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  const [index, setIndex] = useState(0);

  const emojiFallback = (
    <span className="flex aspect-[4/3] w-full items-center justify-center text-9xl" aria-hidden>
      {productEmojiFor(product)}
    </span>
  );

  if (images.length === 0) {
    return (
      <div className="animate-float rounded-card border border-slate-200 bg-surface-sunken shadow-card">
        {emojiFallback}
      </div>
    );
  }

  const previous = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="space-y-3">
      <div
        className="group relative overflow-hidden rounded-card border border-slate-200 bg-surface-sunken shadow-card"
        aria-roledescription="carousel"
        aria-label={`${product.name} images`}
      >
        {/* Sliding track: one full-width frame per image. */}
        <div
          className="flex transition-transform duration-500 ease-out-expo"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={src} className="aspect-[4/3] w-full shrink-0">
              <ImageWithFallback
                src={src}
                alt={`${product.name} — image ${i + 1} of ${images.length}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                fallback={emojiFallback}
              />
            </div>
          ))}
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-700 shadow-card opacity-0 transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95 group-hover:opacity-100 focus-visible:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-700 shadow-card opacity-0 transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95 group-hover:opacity-100 focus-visible:opacity-100"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    'h-1.5 rounded-full shadow transition-all duration-300',
                    i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90',
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3" role="tablist" aria-label="Image thumbnails">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                'h-16 w-20 overflow-hidden rounded-lg border-2 bg-surface-sunken transition-all duration-200 hover:-translate-y-0.5',
                i === index
                  ? 'border-brand-500 shadow-glow'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <ImageWithFallback src={src} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
