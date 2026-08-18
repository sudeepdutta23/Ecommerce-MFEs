import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CategoryCircle, DealCard, ImageWithFallback, Reveal, SectionHeader, cn } from '@ecom/ui';
import {
  brandPromos,
  dailyEssentials,
  heroSlides,
  smartphoneDeals,
  topCategories,
} from './home-data';

const HERO_AUTOPLAY_MS = 5000;

function ViewAllLink({ to }: { to: string }) {
  return (
    <Link to={to} className="group flex items-center gap-1 whitespace-nowrap transition-colors hover:text-brand-600">
      View All{' '}
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
        ›
      </span>
    </Link>
  );
}

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = heroSlides[index] ?? heroSlides[0]!;
  const previous = () => setIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  const next = () => setIndex((i) => (i + 1) % heroSlides.length);

  // Auto-advance; paused while hovered and disabled for reduced motion.
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(next, HERO_AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, index]);

  return (
    <section
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-[length:200%_200%] px-6 py-8 text-white transition-colors duration-700 animate-gradient-pan sm:px-16 sm:py-14',
        slide.bgClass,
      )}
    >
      {/* Banner photo over the gradient (which doubles as the loading/error fallback),
          darkened on the left so the copy stays readable. */}
      <div key={`bg-${index}`} aria-hidden className="absolute inset-0 animate-fade-in">
        <ImageWithFallback src={slide.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

      {/* Decorative glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative flex items-center justify-between gap-8">
        {/* Re-keying restarts the entrance animations on every slide change. */}
        <div key={index}>
          <p className="animate-fade-in-down text-sm text-white/80">{slide.eyebrow}</p>
          <h1
            className="mt-2 animate-slide-in-right text-4xl font-extrabold tracking-wide sm:text-5xl"
            style={{ animationDelay: '80ms' }}
          >
            {slide.title}
          </h1>
          <p
            className="mt-3 animate-fade-in-up text-xl font-semibold text-white/90"
            style={{ animationDelay: '180ms' }}
          >
            {slide.subtitle}
          </p>

          <div className="mt-8 flex items-center gap-1.5">
            {heroSlides.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}: ${s.title}`}
                aria-current={i === index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70',
                )}
              />
            ))}
          </div>
        </div>

        <div key={`art-${index}`} className="relative hidden shrink-0 animate-scale-in sm:block" aria-hidden>
          <div className="absolute inset-0 -m-8 animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-white/20" />
          <div className="absolute inset-0 -m-16 animate-[spin_40s_linear_infinite_reverse] rounded-full border border-white/10" />
          <div className="relative h-40 w-40 animate-float overflow-hidden rounded-full shadow-2xl ring-4 ring-white/25">
            <ImageWithFallback
              src={slide.artImage}
              alt=""
              fallback={
                <span className="flex h-full w-full items-center justify-center bg-white/10 text-[5rem] leading-none drop-shadow-lg">
                  {slide.emoji}
                </span>
              }
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={previous}
        aria-label="Previous offer"
        className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl text-slate-700 shadow-card transition-all duration-200 hover:scale-110 hover:bg-brand-50 active:scale-95 sm:flex"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next offer"
        className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl text-slate-700 shadow-card transition-all duration-200 hover:scale-110 hover:bg-brand-50 active:scale-95 sm:flex"
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
        <Reveal>
          <SectionHeader
            title={
              <>
                Grab the best deal on <span className="text-brand-500">Smartphones</span>
              </>
            }
            action={<ViewAllLink to="/catalog?category=Smartphones" />}
          />
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {smartphoneDeals.map((deal, i) => (
            <Reveal key={deal.id} delay={i * 80}>
              <Link to="/catalog?category=Smartphones" className="block h-full">
                <DealCard
                  name={deal.name}
                  price={deal.price}
                  mrp={deal.mrp}
                  media={
                    <ImageWithFallback
                      src={deal.image}
                      alt=""
                      fallback={<span aria-hidden>{deal.emoji}</span>}
                    />
                  }
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Top categories */}
      <section>
        <Reveal>
          <SectionHeader
            title={
              <>
                Shop From <span className="text-brand-500">Top Categories</span>
              </>
            }
            action={<ViewAllLink to="/catalog" />}
          />
        </Reveal>
        <div className="no-scrollbar -mx-6 mt-6 flex gap-4 overflow-x-auto px-6 sm:mx-0 sm:flex-wrap sm:justify-between sm:overflow-x-visible sm:px-0">
          {topCategories.map((category, i) => (
            <Reveal key={category.label} delay={i * 60} className="shrink-0">
              <Link to="/catalog">
                <CategoryCircle
                  icon={
                    <ImageWithFallback
                      src={category.image}
                      alt=""
                      className="h-24 w-24 rounded-full"
                      fallback={<span aria-hidden>{category.icon}</span>}
                    />
                  }
                  label={category.label}
                  active={category.active}
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Brand promos */}
      <section>
        <Reveal>
          <SectionHeader
            title={
              <>
                Top <span className="text-brand-500">Electronics Brands</span>
              </>
            }
            action={<ViewAllLink to="/catalog?category=Smartphones" />}
          />
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {brandPromos.map((promo, i) => (
            <Reveal key={promo.id} delay={i * 100}>
              <Link
                to="/catalog?category=Smartphones"
                className={cn(
                  'group flex items-center justify-between overflow-hidden rounded-2xl p-6',
                  'transition-all duration-300 ease-out-expo hover:-translate-y-1.5 hover:shadow-card-hover',
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
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-6xl shadow-lg transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110"
                  aria-hidden
                >
                  <ImageWithFallback
                    src={promo.image}
                    alt=""
                    fallback={<span>{promo.emoji}</span>}
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Daily essentials */}
      <section>
        <Reveal>
          <SectionHeader
            title={
              <>
                Daily <span className="text-brand-500">Essentials</span>
              </>
            }
            action={<ViewAllLink to="/catalog?category=Daily Essentials" />}
          />
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {dailyEssentials.map((item, i) => (
            <Reveal key={item.label} delay={i * 60}>
              <Link
                to="/catalog?category=Daily Essentials"
                className="group block text-center"
              >
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-card bg-surface-sunken text-5xl transition-all duration-300 ease-out-expo group-hover:-translate-y-1 group-hover:bg-brand-50 group-hover:shadow-card-hover">
                  <span
                    aria-hidden
                    className="flex h-full w-full items-center justify-center transition-transform duration-500 ease-spring group-hover:scale-110"
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt=""
                      fallback={<span>{item.icon}</span>}
                    />
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700 transition-colors group-hover:text-brand-600">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-slate-900">{item.offer}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
