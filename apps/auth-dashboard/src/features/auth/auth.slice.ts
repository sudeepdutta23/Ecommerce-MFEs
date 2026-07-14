import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { type SessionUser } from '@ecom/types';
import {
  clearSession,
  eventBus,
  getAuthToken,
  getRefreshToken,
  getStoredUser,
  storeSession,
} from '@ecom/utils';
import { apiErrorMessage, loginRequest, logoutRequest, meRequest, registerRequest, type AuthResult } from './auth.api';

export interface AuthState {
  user: SessionUser | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  // Rehydrate from persisted session so a page refresh keeps the user signed in.
  user: getStoredUser(),
  status: 'idle',
  error: null,
};

export interface LoginCredentials {
  email: string;
  password: string;
}

/** Persist the session for other MFEs / refreshes, then broadcast the transition. */
function commitSession({ user, tokens }: AuthResult, analyticsEvent: string): SessionUser {
  storeSession(tokens.accessToken, user, tokens.refreshToken);
  eventBus.emit('auth:login', { user });
  eventBus.emit('analytics:track', { name: analyticsEvent, source: 'auth-dashboard' });
  return user;
}

export const login = createAsyncThunk<SessionUser, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return commitSession(await loginRequest(email, password), 'login');
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, 'Login failed. Please try again.'));
    }
  },
);

export const register = createAsyncThunk<SessionUser, LoginCredentials, { rejectValue: string }>(
  'auth/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return commitSession(await registerRequest(email, password), 'register');
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, 'Registration failed. Please try again.'));
    }
  },
);

/**
 * Validate the persisted session against GET /auth/me. An expired access
 * token is refreshed transparently by the http-client interceptor; if that
 * fails too, the interceptor clears the session and broadcasts auth:logout.
 */
export const syncSession = createAsyncThunk<SessionUser | null>('auth/syncSession', async () => {
  if (!getAuthToken()) return null;
  const user = await meRequest();
  const token = getAuthToken();
  if (token) {
    storeSession(token, user);
  }
  return user;
});

/** Revoke the refresh token server-side (best effort), then clear locally. */
export const logout = createAsyncThunk<void>('auth/logout', async () => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await logoutRequest(refreshToken);
    } catch {
      // Revocation is best-effort — the local session is cleared regardless.
    }
  }
  clearSession();
  eventBus.emit('auth:logout');
  eventBus.emit('analytics:track', { name: 'logout', source: 'auth-dashboard' });
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
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
      .addMatcher(isAnyOf(login.pending, register.pending), (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(isAnyOf(login.fulfilled, register.fulfilled), (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addMatcher(isAnyOf(login.rejected, register.rejected), (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Something went wrong. Please try again.';
      });
  },
});

export const { clearError } = authSlice.actions;
export const authReducer = authSlice.reducer;
