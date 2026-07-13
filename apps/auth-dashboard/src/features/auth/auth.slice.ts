import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type SessionUser } from '@ecom/types';
import { clearSession, eventBus, getStoredUser, storeSession } from '@ecom/utils';

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

/**
 * Demo login: replace the fake latency + token with a call to your auth API
 * (e.g. via createApiClient from @ecom/utils).
 */
export const login = createAsyncThunk<SessionUser, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!email.includes('@') || password.length < 4) {
      return rejectWithValue('Invalid email or password (password must be 4+ characters).');
    }

    const user: SessionUser = {
      id: crypto.randomUUID(),
      name: email.split('@')[0] ?? 'Customer',
      email,
      role: 'customer',
    };

    // Persist for other MFEs / page refreshes, then broadcast the transition.
    storeSession(`demo-token-${user.id}`, user);
    eventBus.emit('auth:login', { user });
    eventBus.emit('analytics:track', { name: 'login', source: 'auth-dashboard' });
    return user;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
      clearSession();
      eventBus.emit('auth:logout');
      eventBus.emit('analytics:track', { name: 'logout', source: 'auth-dashboard' });
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<SessionUser>) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed. Please try again.';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export const authReducer = authSlice.reducer;
