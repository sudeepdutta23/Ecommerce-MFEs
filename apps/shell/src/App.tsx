import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
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
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Remote routes are generated from the registry: each remote owns
              everything under its path segment via the trailing wildcard. */}
          {remotes.map((remote) => (
            <Route
              key={remote.scope}
              path={`${remote.routePath}/*`}
              element={<RemoteModule remote={remote} />}
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
