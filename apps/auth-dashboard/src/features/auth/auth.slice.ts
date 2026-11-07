import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { type SessionUser } from '@ecom/types';
import {
  apiErrorCode,
  apiErrorMessage,
  authApi,
  endLocalSession,
  eventBus,
  getAuthToken,
  getStoredUser,
  mergeGuestCart,
  profileApi,
  refreshCart,
  storeAccessToken,
  storeSession,
  type Me,
} from '@ecom/utils';

export interface AuthState {
  user: SessionUser | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  /** The backend's error code of the last failure, e.g. to offer a new verification email. */
  errorCode: string | null;
}

const initialState: AuthState = {
  // Rehydrate from persisted session so a page refresh keeps the user signed in.
  user: getStoredUser(),
  status: 'idle',
  error: null,
  errorCode: null,
};

export interface LoginCredentials {
  email: string;
  password: string;
}

interface Rejection {
  message: string;
  code: string | null;
}

/** The account's display name comes from its profile; before one is saved, from the email. */
async function toSessionUser(me: Me): Promise<SessionUser> {
  const profile = await profileApi.get().catch(() => null);
  const fullName = [profile?.givenName, profile?.familyName].filter(Boolean).join(' ');
  return {
    id: me.id,
    name: fullName || (me.email.split('@')[0] ?? me.email),
    email: me.email,
    role: me.roles.includes('ADMIN') ? 'admin' : 'customer',
    roles: me.roles,
    permissions: me.permissions,
  };
}

export const login = createAsyncThunk<SessionUser, LoginCredentials, { rejectValue: Rejection }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { accessToken } = await authApi.login(email, password);
      storeAccessToken(accessToken);
      const user = await toSessionUser(await authApi.me());
      storeSession(accessToken, user);
      await mergeGuestCart().catch(() => undefined);
      eventBus.emit('auth:login', { user });
      eventBus.emit('analytics:track', { name: 'login', source: 'auth-dashboard' });
      return user;
    } catch (error) {
      return rejectWithValue({
        message: apiErrorMessage(error, 'Login failed. Please try again.'),
        code: apiErrorCode(error) ?? null,
      });
    }
  },
);

/**
 * Registration signs nobody in: the account stays pending until the emailed link is used. The answer
 * is the same for a new and an existing address, so it cannot reveal who has an account.
 */
export const register = createAsyncThunk<void, LoginCredentials, { rejectValue: Rejection }>(
  'auth/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await authApi.register(email, password);
      eventBus.emit('analytics:track', { name: 'register', source: 'auth-dashboard' });
    } catch (error) {
      return rejectWithValue({
        message: apiErrorMessage(error, 'Registration failed. Please try again.'),
        code: apiErrorCode(error) ?? null,
      });
    }
  },
);

/**
 * Validate the persisted session against GET /auth/me. An expired access
 * token is refreshed transparently by the http-client interceptor; if that
 * fails too, the interceptor clears the session and broadcasts auth:logout.
 */
export const syncSession = createAsyncThunk<SessionUser | null>('auth/syncSession', async () => {
  const token = getAuthToken();
  if (!token) return null;
  const user = await toSessionUser(await authApi.me());
  const current = getAuthToken();
  if (current) storeSession(current, user);
  await refreshCart().catch(() => undefined);
  return user;
});

/** Revoke the refresh token server-side (best effort), then clear locally. */
export const logout = createAsyncThunk<void>('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch {
    // Revocation is best-effort: the local session is cleared regardless.
  }
  endLocalSession();
  eventBus.emit('analytics:track', { name: 'logout', source: 'auth-dashboard' });
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
      state.errorCode = null;
    },
    /** The session ended elsewhere: erased or deactivated account, or the interceptor's forced sign-out. */
    sessionEnded(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(syncSession.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(syncSession.rejected, (state) => {
        // The interceptor may have cleared the session (expired refresh token).
        state.user = getStoredUser();
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addMatcher(isAnyOf(login.pending, register.pending), (state) => {
        state.status = 'loading';
        state.error = null;
        state.errorCode = null;
      })
      .addMatcher(isAnyOf(login.rejected, register.rejected), (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? 'Something went wrong. Please try again.';
        state.errorCode = action.payload?.code ?? null;
      });
  },
});

export const { clearError, sessionEnded } = authSlice.actions;
export const authReducer = authSlice.reducer;
