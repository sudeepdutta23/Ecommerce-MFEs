import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventBus, getCartCount } from '@ecom/utils';
import { cn } from '@ecom/ui';
import { useSession } from '@/session/useSession';
import {
  AppleIcon,
  CartIcon,
  ChevronDownIcon,
  FacebookIcon,
  GooglePlayIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  PhoneIcon,
  SearchIcon,
  TagIcon,
  TruckIcon,
  UserIcon,
  WhatsAppIcon,
  XSocialIcon,
  YouTubeIcon,
} from './icons';

/**
 * Category pills in the header nav. Each maps to a catalog category via URL
 * params — the shell never talks to the catalog MFE directly.
 */
const CATEGORY_PILLS: Array<{ label: string; category: string }> = [
  { label: 'Groceries', category: 'Daily Essentials' },
  { label: 'Premium Fruits', category: 'Daily Essentials' },
  { label: 'Home & Kitchen', category: 'all' },
  { label: 'Fashion', category: 'all' },
  { label: 'Electronics', category: 'Smartphones' },
  { label: 'Beauty', category: 'all' },
  { label: 'Home Improvement', category: 'all' },
  { label: 'Sports, Toys & Luggage', category: 'all' },
];

const FOOTER_CATEGORIES = [
  'Staples',
  'Beverages',
  'Personal Care',
  'Home Care',
  'Baby Care',
  'Vegetables & Fruits',
  'Snacks & Foods',
  'Dairy & Bakery',
];

const FOOTER_SERVICES = [
  'About Us',
  'Terms & Conditions',
  'FAQ',
  'Privacy Policy',
  'E-waste Policy',
  'Cancellation & Return Policy',
];

/**
 * Live cart badge count. The cart is shared state (cart-storage in
 * @ecom/utils); the shell hydrates the count from storage and stays in sync
 * via `cart:changed` broadcasts — same pattern as useSession. `cart:item-added`
 * only drives the pop animation.
 */
function useCartCount(): { count: number; bumped: boolean } {
  const [count, setCount] = useState(() => getCartCount());
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    const offChanged = eventBus.on('cart:changed', ({ count: next }) => {
      setCount(next);
    });
    const offAdded = eventBus.on('cart:item-added', () => {
      setBumped(false);
      // Restart the pop animation even for rapid consecutive adds.
      requestAnimationFrame(() => setBumped(true));
    });
    return () => {
      offChanged();
      offAdded();
    };
  }, []);

  return { count, bumped };
}

/** Newsletter signup (demo: no backend, just optimistic confirmation). */
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  if (subscribed) {
    return (
      <p className="flex animate-scale-in items-center gap-2 text-sm font-semibold text-white">
        <span aria-hidden>🎉</span> You&apos;re on the list — deals incoming!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <div className="relative flex-1">
        <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          aria-label="Email address for newsletter"
          className="w-full rounded-lg border border-white/15 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white transition-all duration-300 placeholder:text-white/50 focus:border-brand-400 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-px hover:bg-brand-400 hover:shadow-glow active:translate-y-0 active:scale-[0.97]"
      >
        Subscribe
      </button>
    </form>
  );
}

const SOCIALS = [
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'X', Icon: XSocialIcon },
  { label: 'YouTube', Icon: YouTubeIcon },
];

const PAYMENT_METHODS = ['VISA', 'Mastercard', 'UPI', 'RuPay'];

/** True once the page is scrolled, to deepen the sticky header's shadow. */
function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}

export function Layout({ children }: { children: ReactNode }) {
  const user = useSession();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { count: cartCount, bumped } = useCartCount();
  const scrolled = useScrolled();
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(search.trim())}`);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7 * (direction === 'left' ? -1 : 1);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
      {/* Top utility strip */}
      <div className="bg-surface-sunken text-xs text-slate-500">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-2">
          <p className="hidden truncate sm:block">Welcome to worldwide SudeepMart!</p>
          <div className="ml-auto flex items-center gap-6 whitespace-nowrap">
            {user?.role === 'admin' ? (
              // Plain anchor + new tab: the console is a separate platform,
              // so it opens alongside the storefront rather than inside it.
              <a
                href="/admin"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                Admin Console <span aria-hidden>↗</span>
              </a>
            ) : null}
            <span className="hidden items-center gap-1.5 sm:flex">
              <MapPinIcon className="h-3.5 w-3.5 text-brand-500" />
              Deliver to <b className="font-semibold text-slate-700">423651</b>
            </span>
            <Link
              to="/orders"
              className="flex items-center gap-1.5 transition-colors hover:text-brand-600"
            >
              <TruckIcon className="h-3.5 w-3.5 text-brand-500" />
              Track your order
            </Link>
            <Link
              to="/catalog"
              className="hidden items-center gap-1.5 transition-colors hover:text-brand-600 sm:flex"
            >
              <TagIcon className="h-3.5 w-3.5 text-brand-500" />
              All Offers
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={cn(
          'sticky top-0 z-20 border-b bg-white/90 backdrop-blur-md transition-all duration-300',
          scrolled ? 'border-slate-200 shadow-md shadow-slate-900/5' : 'border-slate-100',
        )}
      >
        <div className="mx-auto flex max-w-content items-center gap-4 px-6 py-4 sm:gap-6">
          {/* <button
            type="button"
            aria-label="Menu"
            className="rounded-lg bg-surface-sunken p-2 text-brand-500 transition-all duration-200 hover:scale-105 hover:bg-brand-50 active:scale-95"
          >
            <MenuIcon className="h-5 w-5" />
          </button> */}

          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-brand-500 transition-transform duration-200 hover:scale-[1.03]"
          >
            SudeepMart
          </Link>

          <form onSubmit={handleSearch} role="search" className="group relative mx-auto hidden w-full max-w-xl flex-1 md:block">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500 transition-transform duration-200 group-focus-within:scale-110" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search essentials, groceries and more..."
              aria-label="Search products"
              className="w-full rounded-lg border-0 bg-surface-sunken py-2.5 pl-11 pr-4 text-sm text-slate-700 transition-shadow duration-300 placeholder:text-slate-400 focus:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </form>

          <div className="ml-auto flex items-center gap-4 whitespace-nowrap text-sm font-medium text-slate-700 md:ml-0">
            <Link to="/account" className="group flex items-center gap-2 transition-colors hover:text-brand-600">
              <UserIcon className="h-5 w-5 text-brand-500 transition-transform duration-200 group-hover:scale-110" />
              {user ? user.name : 'Sign Up/Sign In'}
            </Link>
            <span className="h-5 w-px bg-slate-200" aria-hidden />
            <Link
              to="/orders"
              className="group hidden items-center gap-2 transition-colors hover:text-brand-600 sm:flex"
            >
              <TruckIcon className="h-5 w-5 text-brand-500 transition-transform duration-200 group-hover:scale-110" />
              Orders
            </Link>
            <span className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />
            <Link to="/cart" className="group flex items-center gap-2 transition-colors hover:text-brand-600">
              <span className="relative">
                <CartIcon className="h-5 w-5 text-brand-500 transition-transform duration-200 group-hover:scale-110" />
                {cartCount > 0 ? (
                  <span
                    key={bumped ? 'bumped' : 'idle'}
                    className={cn(
                      'absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-none text-white',
                      bumped && 'animate-pop',
                    )}
                    aria-label={`${cartCount} items in cart`}
                  >
                    {cartCount}
                  </span>
                ) : null}
              </span>
              Cart
            </Link>
          </div>
        </div>

        {/* Mobile search (the inline header search is hidden below md) */}
        <div className="mx-auto max-w-content px-6 pb-3 md:hidden">
          <form onSubmit={handleSearch} role="search" className="group relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500 transition-transform duration-200 group-focus-within:scale-110" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search essentials, groceries and more..."
              aria-label="Search products"
              className="w-full rounded-lg border-0 bg-surface-sunken py-2.5 pl-11 pr-4 text-sm text-slate-700 transition-shadow duration-300 placeholder:text-slate-400 focus:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </form>
        </div>

        {/* Category pill nav */}
        <nav aria-label="Categories" className="mx-auto max-w-content px-6 pb-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              aria-label="Scroll categories left"
              className="absolute left-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg text-slate-700 shadow-card transition-all duration-200 hover:scale-110 hover:bg-brand-50 active:scale-95 sm:flex"
            >
              ‹
            </button>
            <div
              ref={categoryScrollRef}
              className="no-scrollbar flex items-center gap-3 overflow-x-auto scroll-smooth sm:px-11"
            >
              {CATEGORY_PILLS.map((pill) => (
                <Link
                  key={pill.label}
                  to={`/catalog?category=${encodeURIComponent(pill.category)}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-sunken px-4 py-2 text-sm text-slate-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-500 hover:text-white hover:shadow-md active:translate-y-0"
                >
                  {pill.label}
                  <ChevronDownIcon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => scrollCategories('right')}
              aria-label="Scroll categories right"
              className="absolute right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg text-slate-700 shadow-card transition-all duration-200 hover:scale-110 hover:bg-brand-50 active:scale-95 sm:flex"
            >
              ›
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-content flex-1 animate-fade-in px-6 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative mt-16 overflow-hidden bg-gradient-to-br from-navy via-[#252e4f] to-[#131828] text-white">
        {/* Brand accent line + soft glows */}
        <div aria-hidden className="h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-800" />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl"
        />

        {/* Newsletter band */}
        <div className="relative border-b border-white/10">
          <div className="mx-auto flex max-w-content flex-col gap-5 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xl font-bold">
                Get deals before anyone else <span aria-hidden>🎁</span>
              </p>
              <p className="mt-1 text-sm text-white/60">
                Subscribe for launch-day offers, price drops and exclusive coupons.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        {/* Main columns */}
        <div className="relative mx-auto grid max-w-content gap-12 px-6 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-3xl font-extrabold tracking-tight">
              Sudeep<span className="text-brand-400">Mart</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              Everything you love, delivered fast. Groceries, gadgets and daily essentials from
              brands you trust — all in one place.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href="https://wa.me/916000587566"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 transition-colors duration-200 group-hover:bg-brand-500 group-hover:text-white">
                  <WhatsAppIcon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-xs text-white/60">WhatsApp</span>
                  <span className="text-sm font-medium">+91 60005-87566</span>
                </span>
              </a>
              <a
                href="tel:+916000587566"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 transition-colors duration-200 group-hover:bg-brand-500 group-hover:text-white">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-xs text-white/60">Call Us</span>
                  <span className="text-sm font-medium">+91 60005-87566</span>
                </span>
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all duration-200 hover:-translate-y-1 hover:bg-brand-500 hover:text-white hover:shadow-glow"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#"
                className="flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
              >
                <AppleIcon className="h-6 w-6" />
                <span className="leading-tight">
                  <span className="block text-[10px] text-white/60">Download on the</span>
                  <span className="block text-sm font-semibold">App Store</span>
                </span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10"
              >
                <GooglePlayIcon className="h-5 w-5" />
                <span className="leading-tight">
                  <span className="block text-[10px] text-white/60">Get it on</span>
                  <span className="block text-sm font-semibold">Google Play</span>
                </span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Popular Categories
              <span aria-hidden className="mt-2 block h-0.5 w-8 rounded bg-brand-400" />
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {FOOTER_CATEGORIES.map((item) => (
                <li key={item}>
                  <Link
                    to="/catalog"
                    className="group inline-flex items-center gap-1.5 text-white/60 transition-all duration-200 hover:translate-x-1 hover:text-white"
                  >
                    <span
                      aria-hidden
                      className="text-brand-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    >
                      ›
                    </span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Customer Services
              <span aria-hidden className="mt-2 block h-0.5 w-8 rounded bg-brand-400" />
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {FOOTER_SERVICES.map((item) => (
                <li key={item}>
                  <span className="group inline-flex cursor-pointer items-center gap-1.5 text-white/60 transition-all duration-200 hover:translate-x-1 hover:text-white">
                    <span
                      aria-hidden
                      className="text-brand-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    >
                      ›
                    </span>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-white/50 sm:flex-row">
            <p>© 2026 SudeepMart — microfrontend demo storefront. All rights reserved.</p>
            <div className="flex items-center gap-2" aria-label="Accepted payment methods">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="rounded border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-semibold tracking-wide text-white/70"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
