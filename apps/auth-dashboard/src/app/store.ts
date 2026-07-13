import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@/features/auth/auth.slice';

/**
 * Redux store PRIVATE to the auth-dashboard MFE.
 *
 * It is created per mount (see App.tsx) and never exported across the
 * federation boundary. Other MFEs learn about auth changes only through
 * the event bus contract and persisted session storage.
 */
export function createAuthStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  });
}

export type AuthStore = ReturnType<typeof createAuthStore>;
export type RootState = ReturnType<AuthStore['getState']>;
export type AppDispatch = AuthStore['dispatch'];
