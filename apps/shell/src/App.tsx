import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RemoteModule } from '@/remotes/RemoteModule';
import { remotes } from '@/remotes/remotes.config';

export function App() {
  return (
    <BrowserRouter>
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
