import { type SessionUser } from '@ecom/types';
import { ApiError, http } from '@ecom/utils';

/**
 * Typed client for the auth-service (via the API gateway), matching the
 * backend contract in Ecommerce-Microservices docs/postman:
 *   POST /auth/register  { email, password }        → 201 { user, tokens }
 *   POST /auth/login     { email, password }        → 200 { user, tokens }
 *   GET  /auth/me                                   → 200 { user }
 *   POST /auth/refresh   { refreshToken }           → 200 { tokens }  (handled by the interceptor)
 *   POST /auth/logout    { refreshToken }           → 204 (revokes the refresh token)
 * All responses use the standard `{ success, data }` envelope; errors are
 * `{ success: false, error: { code, message } }`.
 */

interface BackendUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Access token lifetime in seconds. */
  expiresIn: number;
}

interface Envelope<T> {
  success: boolean;
  data: T;
}

export interface AuthResult {
  user: SessionUser;
  tokens: TokenPair;
}

/** Backend has no display name — derive one from the email local part. */
function toSessionUser(user: BackendUser): SessionUser {
  return {
    id: user.id,
    name: user.email.split('@')[0] ?? user.email,
    email: user.email,
    role: user.role === 'ADMIN' ? 'admin' : 'customer',
  };
}

export async function loginRequest(email: string, password: string): Promise<AuthResult> {
  const { data } = await http.post<Envelope<{ user: BackendUser; tokens: TokenPair }>>(
    '/auth/login',
    { email, password },
  );
  return { user: toSessionUser(data.data.user), tokens: data.data.tokens };
}

export async function registerRequest(email: string, password: string): Promise<AuthResult> {
  const { data } = await http.post<Envelope<{ user: BackendUser; tokens: TokenPair }>>(
    '/auth/register',
    { email, password },
  );
  return { user: toSessionUser(data.data.user), tokens: data.data.tokens };
}

export async function meRequest(): Promise<SessionUser> {
  const { data } = await http.get<Envelope<{ user: BackendUser }>>('/auth/me');
  return toSessionUser(data.data.user);
}

/** Best-effort server-side revocation of the refresh token (204). */
export async function logoutRequest(refreshToken: string): Promise<void> {
  await http.post('/auth/logout', { refreshToken });
}

/** Human-readable message from the backend error envelope. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Cannot reach the server — is the backend gateway running on :8080?';
    }
    const body = error.body as { error?: { message?: string } } | null;
    if (body?.error?.message) {
      return body.error.message;
    }
  }
  return fallback;
}
