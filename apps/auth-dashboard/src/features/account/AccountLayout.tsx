import { useEffect } from 'react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { cn } from '@ecom/ui';
import { eventBus } from '@ecom/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { sessionEnded, syncSession } from '@/features/auth/auth.slice';

const TABS = [
  { to: '.', end: true, label: 'Overview' },
  { to: 'profile', end: false, label: 'Profile' },
  { to: 'addresses', end: false, label: 'Addresses' },
  { to: 'notifications', end: false, label: 'Notifications' },
  { to: 'security', end: false, label: 'Security' },
  { to: 'seller', end: false, label: 'Selling' },
  { to: 'privacy', end: false, label: 'Privacy' },
];

/** The signed-in account area. Revalidates the session against the backend once per mount. */
export function AccountLayout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    void dispatch(syncSession());
    return eventBus.on('auth:logout', () => {
      dispatch(sessionEnded());
    });
  }, [dispatch]);

  if (!user) {
    return <Navigate to="login" replace />;
  }

  return (
    <div className="space-y-6">
      <nav aria-label="Account sections" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-slate-200 pb-2">
        {TABS.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-surface-sunken hover:text-slate-900',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
