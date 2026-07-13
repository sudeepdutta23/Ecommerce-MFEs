import { type SessionUser } from '@ecom/types';

/**
 * Auth token/session helpers.
 *
 * localStorage is the shared persistence layer for the session so that any
 * MFE (and the shell) can bootstrap auth state without talking to another
 * MFE. Login/logout transitions are broadcast separately via the event bus.
 */

const TOKEN_KEY = 'ecom.auth.token';
const USER_KEY = 'ecom.auth.user';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): SessionUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function storeSession(token: string, user: SessionUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
