import { useState } from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { createAuthStore } from '@/app/store';
import { AccountLayout } from '@/features/account/AccountLayout';
import { AddressesPage } from '@/features/account/AddressesPage';
import { NotificationsPage } from '@/features/account/NotificationsPage';
import { PrivacyPage } from '@/features/account/PrivacyPage';
import { ProfilePage } from '@/features/account/ProfilePage';
import { SecurityPage } from '@/features/account/SecurityPage';
import { DashboardPage } from '@/features/auth/DashboardPage';
import { LoginPage } from '@/features/auth/LoginPage';
import {
  AcceptInvitationPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from '@/features/auth/PublicPages';
import { SellerHomePage } from '@/features/seller/SellerHomePage';
import { SellerShopPage } from '@/features/seller/SellerShopPage';
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
        <Route path="login" element={<LoginPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="invitations/accept" element={<AcceptInvitationPage />} />
        <Route element={<AccountLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="seller" element={<SellerHomePage />} />
          <Route path="seller/:orgId/*" element={<SellerShopPage />} />
        </Route>
      </Routes>
    </Provider>
  );
}
