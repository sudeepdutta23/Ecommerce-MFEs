import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/session/useSession';
import {
  AppleIcon,
  CartIcon,
  ChevronDownIcon,
  GooglePlayIcon,
  MapPinIcon,
  MenuIcon,
  PhoneIcon,
  SearchIcon,
  TagIcon,
  TruckIcon,
  UserIcon,
  WhatsAppIcon,
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

export function Layout({ children }: { children: ReactNode }) {
  const user = useSession();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
      {/* Top utility strip */}
      <div className="bg-surface-sunken text-xs text-slate-500">
        <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-2">
          <p className="truncate">Welcome to worldwide MegaMart!</p>
          <div className="flex items-center gap-6 whitespace-nowrap">
            <span className="hidden items-center gap-1.5 sm:flex">
              <MapPinIcon className="h-3.5 w-3.5 text-brand-500" />
              Deliver to <b className="font-semibold text-slate-700">423651</b>
            </span>
            <Link to="/analytics" className="flex items-center gap-1.5 hover:text-brand-600">
              <TruckIcon className="h-3.5 w-3.5 text-brand-500" />
              Track your order
            </Link>
            <Link to="/catalog" className="hidden items-center gap-1.5 hover:text-brand-600 sm:flex">
              <TagIcon className="h-3.5 w-3.5 text-brand-500" />
              All Offers
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-content items-center gap-4 px-6 py-4 sm:gap-6">
          <button
            type="button"
            aria-label="Menu"
            className="rounded-lg bg-surface-sunken p-2 text-brand-500 hover:bg-brand-50"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <Link to="/" className="text-2xl font-bold tracking-tight text-brand-500">
            MegaMart
          </Link>

          <form onSubmit={handleSearch} role="search" className="relative mx-auto hidden w-full max-w-xl flex-1 md:block">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search essentials, groceries and more..."
              aria-label="Search products"
              className="w-full rounded-lg border-0 bg-surface-sunken py-2.5 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </form>

          <div className="ml-auto flex items-center gap-4 whitespace-nowrap text-sm font-medium text-slate-700 md:ml-0">
            <Link to="/account" className="flex items-center gap-2 hover:text-brand-600">
              <UserIcon className="h-5 w-5 text-brand-500" />
              {user ? user.name : 'Sign Up/Sign In'}
            </Link>
            <span className="h-5 w-px bg-slate-200" aria-hidden />
            <Link to="/catalog" className="flex items-center gap-2 hover:text-brand-600">
              <CartIcon className="h-5 w-5 text-brand-500" />
              Cart
            </Link>
          </div>
        </div>

        {/* Category pill nav */}
        <nav aria-label="Categories" className="mx-auto max-w-content px-6 pb-4">
          <div className="no-scrollbar flex items-center gap-3 overflow-x-auto">
            {CATEGORY_PILLS.map((pill) => (
              <Link
                key={pill.label}
                to={`/catalog?category=${encodeURIComponent(pill.category)}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-sunken px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-brand-500 hover:text-white"
              >
                {pill.label}
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-content flex-1 px-6 py-6">{children}</main>

      {/* Footer */}
      <footer className="mt-10 bg-brand-500 text-white">
        <div className="mx-auto grid max-w-content gap-10 px-6 py-12 md:grid-cols-3">
          <div>
            <p className="text-2xl font-bold">MegaMart</p>

            <h3 className="mt-6 text-sm font-semibold">Contact Us</h3>
            <ul className="mt-3 space-y-3 text-sm text-white/90">
              <li className="flex items-start gap-2.5">
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  WhatsApp
                  <br />
                  +1 202-918-2132
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Call Us
                  <br />
                  +1 202-918-2132
                </span>
              </li>
            </ul>

            <h3 className="mt-6 text-sm font-semibold">Download App</h3>
            <div className="mt-3 flex gap-3">
              <span className="flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-xs font-medium">
                <AppleIcon className="h-3.5 w-3.5" />
                App Store
              </span>
              <span className="flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-xs font-medium">
                <GooglePlayIcon className="h-3.5 w-3.5" />
                Google Play
              </span>
            </div>
          </div>

          <div>
            <h3 className="border-b border-white/30 pb-2 text-base font-semibold">
              Most Popular Categories
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/90">
              {FOOTER_CATEGORIES.map((item) => (
                <li key={item} className="list-inside list-disc">
                  <Link to="/catalog" className="hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="border-b border-white/30 pb-2 text-base font-semibold">
              Customer Services
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/90">
              {FOOTER_SERVICES.map((item) => (
                <li key={item} className="list-inside list-disc">
                  <span className="cursor-pointer hover:underline">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20">
          <p className="mx-auto max-w-content px-6 py-4 text-center text-xs text-white/80">
            © 2026 All rights reserved. MegaMart — microfrontend demo storefront.
          </p>
        </div>
      </footer>
    </div>
  );
}
