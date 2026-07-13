import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CategoryCircle, DealCard, SectionHeader, cn } from '@ecom/ui';
import {
  brandPromos,
  dailyEssentials,
  heroSlides,
  smartphoneDeals,
  topCategories,
} from './home-data';

function ViewAllLink({ to }: { to: string }) {
  return (
    <Link to={to} className="flex items-center gap-1 hover:text-brand-600">
      View All <span aria-hidden>›</span>
    </Link>
  );
}

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const slide = heroSlides[index] ?? heroSlides[0]!;
  const previous = () => setIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  const next = () => setIndex((i) => (i + 1) % heroSlides.length);

  return (
    <section
      aria-label="Featured offers"
      className={cn(
        'relative overflow-hidden rounded-2xl px-8 py-10 text-white transition-colors sm:px-16 sm:py-14',
        slide.bgClass,
      )}
    >
      <div className="flex items-center justify-between gap-8">
        <div>
          <p className="text-sm text-white/80">{slide.eyebrow}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-wide sm:text-5xl">{slide.title}</h1>
          <p className="mt-3 text-xl font-semibold text-white/90">{slide.subtitle}</p>

          <div className="mt-8 flex items-center gap-1.5" aria-hidden>
            {heroSlides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40',
                )}
              />
            ))}
          </div>
        </div>

        <div className="relative hidden shrink-0 sm:block" aria-hidden>
          <div className="absolute inset-0 -m-8 rounded-full border border-white/10" />
          <div className="absolute inset-0 -m-16 rounded-full border border-white/10" />
          <span className="relative block text-[7rem] leading-none drop-shadow-lg">
            {slide.emoji}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={previous}
        aria-label="Previous offer"
        className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl text-slate-700 shadow-card hover:bg-brand-50 sm:flex"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next offer"
        className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl text-slate-700 shadow-card hover:bg-brand-50 sm:flex"
      >
        ›
      </button>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="space-y-12 pb-8">
      <HeroCarousel />

      {/* Smartphone deals */}
      <section>
        <SectionHeader
          title={
            <>
              Grab the best deal on <span className="text-brand-500">Smartphones</span>
            </>
          }
          action={<ViewAllLink to="/catalog?category=Smartphones" />}
        />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {smartphoneDeals.map((deal) => (
            <Link key={deal.id} to="/catalog?category=Smartphones">
              <DealCard
                name={deal.name}
                price={deal.price}
                mrp={deal.mrp}
                media={<span aria-hidden>{deal.emoji}</span>}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Top categories */}
      <section>
        <SectionHeader
          title={
            <>
              Shop From <span className="text-brand-500">Top Categories</span>
            </>
          }
          action={<ViewAllLink to="/catalog" />}
        />
        <div className="mt-6 flex flex-wrap justify-between gap-4">
          {topCategories.map((category) => (
            <Link key={category.label} to="/catalog">
              <CategoryCircle icon={category.icon} label={category.label} active={category.active} />
            </Link>
          ))}
        </div>
      </section>

      {/* Brand promos */}
      <section>
        <SectionHeader
          title={
            <>
              Top <span className="text-brand-500">Electronics Brands</span>
            </>
          }
          action={<ViewAllLink to="/catalog?category=Smartphones" />}
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {brandPromos.map((promo) => (
            <Link
              key={promo.id}
              to="/catalog?category=Smartphones"
              className={cn(
                'flex items-center justify-between rounded-2xl p-6 transition-transform hover:-translate-y-0.5',
                promo.cardClass,
              )}
            >
              <div>
                <span
                  className={cn(
                    'inline-block rounded-md px-2.5 py-1 text-xs font-semibold',
                    promo.chipClass,
                  )}
                >
                  {promo.chip}
                </span>
                <p className="mt-4 text-lg font-bold">{promo.tagline}</p>
              </div>
              <span className="text-6xl" aria-hidden>
                {promo.emoji}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Daily essentials */}
      <section>
        <SectionHeader
          title={
            <>
              Daily <span className="text-brand-500">Essentials</span>
            </>
          }
          action={<ViewAllLink to="/catalog?category=Daily Essentials" />}
        />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {dailyEssentials.map((item) => (
            <Link
              key={item.label}
              to="/catalog?category=Daily Essentials"
              className="group text-center"
            >
              <div className="flex h-28 items-center justify-center rounded-card bg-surface-sunken text-5xl transition-shadow group-hover:shadow-card">
                <span aria-hidden>{item.icon}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{item.label}</p>
              <p className="text-sm font-bold text-slate-900">{item.offer}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
