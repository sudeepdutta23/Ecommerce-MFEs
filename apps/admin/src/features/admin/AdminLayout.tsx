import { NavLink, Outlet } from 'react-router-dom';
import { Badge, cn } from '@ecom/ui';
import { useAdminSession } from './useAdminSession';
import { useOrdersSync } from './admin.store';
import {
  ExternalLinkIcon,
  GaugeIcon,
  PackageIcon,
  ScrollIcon,
  ShieldIcon,
  TagIcon,
} from './icons';

const NAV = [
  { to: '.', end: true, label: 'Overview', Icon: GaugeIcon },
  { to: 'orders', end: false, label: 'Orders', Icon: PackageIcon },
  { to: 'products', end: false, label: 'Products', Icon: TagIcon },
  { to: 'audit', end: false, label: 'Audit log', Icon: ScrollIcon },
];

function BrandMark({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
        <ShieldIcon className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold">SudeepMart Ops</p>
        <p className="text-xs opacity-60">{subtitle}</p>
      </div>
    </div>
  );
}

/**
 * Full-viewport console chrome. The console is its own platform — it renders
 * without the storefront header/footer, so this layout owns everything:
 * a dark side rail (top bar with tabs on small screens), the content column,
 * and the storage/event-bus sync that keeps every page's order data live.
 */
export function AdminLayout() {
  const user = useAdminSession();
  useOrdersSync();

  return (
    <div className="flex min-h-screen bg-surface-muted font-sans text-slate-900 animate-fade-in">
      {/* Dark side rail — desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-navy text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <BrandMark subtitle="Admin console" />
        </div>

        <nav aria-label="Admin sections" className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV.map(({ to, end, label, Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            View storefront
          </a>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="text-slate-900 lg:hidden">
              <BrandMark subtitle="Admin console" />
            </div>
            <p className="hidden text-sm text-slate-500 lg:block">
              Operations console — live orders, catalog and audit trail
            </p>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold uppercase text-white">
                  {user.name.slice(0, 2)}
                </span>
                <div className="hidden min-w-0 leading-tight sm:block">
                  <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                  <Badge tone="brand" className="mt-0.5">
                    admin
                  </Badge>
                </div>
              </div>
            ) : null}
          </div>

          {/* Section tabs — small screens (the side rail is hidden) */}
          <nav
            aria-label="Admin sections"
            className="no-scrollbar flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden"
          >
            {NAV.map(({ to, end, label, Icon }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-surface-sunken hover:text-slate-900',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
