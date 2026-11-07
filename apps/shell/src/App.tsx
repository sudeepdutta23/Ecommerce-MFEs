import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RemoteModule } from '@/remotes/RemoteModule';
import { remotes } from '@/remotes/remotes.config';

/**
 * Smooth-scrolls to the top on every route change. Lives in the shell so it
 * covers navigation inside remotes too (they share this router's location).
 * Keyed on pathname only — query-param changes (search/filters) don't scroll.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [pathname]);

  return null;
}

/**
 * The backend's emails and notifications link to these paths; the pages live in the account remote.
 * The query string carries the one-time token, so it must survive the redirect.
 */
const EMAIL_LINKS: Record<string, string> = {
  '/verify-email': '/account/verify-email',
  '/reset-password': '/account/reset-password',
  '/forgot-password': '/account/forgot-password',
  '/invitations/accept': '/account/invitations/accept',
};

function RedirectKeepingQuery({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

function SellerOrderLink() {
  const { orgId, orderId } = useParams();
  return <Navigate to={`/account/seller/${orgId}/orders/${orderId}`} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Standalone remotes are separate platforms (e.g. the admin console):
            they own the full viewport and ship their own layout, so no
            storefront chrome is rendered around them. */}
        {remotes
          .filter((remote) => remote.standalone)
          .map((remote) => (
            <Route
              key={remote.scope}
              path={`${remote.routePath}/*`}
              element={<RemoteModule remote={remote} />}
            />
          ))}

        {/* Everything else is a storefront section and shares the customer
            Layout. Remote routes are generated from the registry: each remote
            owns everything under its path segment via the trailing wildcard. */}
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route path="/" element={<HomePage />} />
          {Object.entries(EMAIL_LINKS).map(([from, to]) => (
            <Route key={from} path={from} element={<RedirectKeepingQuery to={to} />} />
          ))}
          <Route path="/organizations/:orgId/orders/:orderId" element={<SellerOrderLink />} />
          {remotes
            .filter((remote) => !remote.standalone)
            .map((remote) => (
              <Route
                key={remote.scope}
                path={`${remote.routePath}/*`}
                element={<RemoteModule remote={remote} />}
              />
            ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
