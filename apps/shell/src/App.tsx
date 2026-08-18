import { useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
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
