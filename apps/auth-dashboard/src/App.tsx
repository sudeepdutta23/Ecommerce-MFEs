import { useState } from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { createAuthStore } from '@/app/store';
import { DashboardPage } from '@/features/auth/DashboardPage';
import { LoginPage } from '@/features/auth/LoginPage';
import './styles/index.css';

/**
 * Exposed root of the auth-dashboard MFE.
 *
 * - Routes are RELATIVE: the shell mounts this under /account/*, the
 *   standalone bootstrap mounts it at /. Neither side knows the difference.
 * - The Redux store is created inside the component so every mount gets a
 *   fresh, isolated store instance.
 */
export default function App() {
  const [store] = useState(createAuthStore);

  return (
    <Provider store={store}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="login" element={<LoginPage />} />
      </Routes>
    </Provider>
  );
}
