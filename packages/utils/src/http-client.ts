import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';
import { clearSession, getAuthToken, storeAccessToken } from './auth-session';
import { saveCartItems } from './cart-storage';
import { eventBus } from './event-bus';
import { ApiError } from './api-client';

/**
 * Shared axios client for all backend requests.
 *
 * Every instance created here carries the same interceptor stack:
 *
 * Request:
 *  1. Injects `Authorization: Bearer <token>` from the shared auth session.
 *  2. Assigns an `X-Request-Id`: the backend logs it on every line and returns it in every response
 *     and error, so a failure seen here can be found in the server's logs.
 *  3. Stamps a start time for latency measurement.
 *
 * Response:
 *  4. Emits `analytics:track` (`api_request` / `api_request_failed`) with
 *     method, URL, status, duration, and correlation id.
 *  5. Retries idempotent GETs once on transient failures (network, 429/5xx).
 *  6. On 401, transparently gets a new access token (single-flight, with the
 *     rotating HttpOnly refresh cookie, POST /auth/refresh) and replays the
 *     request; if refresh fails, clears the shared session and broadcasts
 *     `auth:logout` so the shell and every MFE sign out together.
 *  7. Normalizes all failures into the existing ApiError shape.
 */

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    /** Set true on requests that must not emit analytics (avoids feedback loops). */
    skipTracking?: boolean;
    /** Internal: set by the request interceptor. */
    metadata?: { startedAt: number; correlationId: string };
    /** Internal: marks a request that already used its retry. */
    retried?: boolean;
    /** Internal: marks a request already replayed after a token refresh. */
    authRetried?: boolean;
  }
}

/** Backend base URL: per-environment via API_GATEWAY_URL (inlined at build time). */
export const API_BASE_URL = process.env.API_GATEWAY_URL ?? 'http://localhost:8080/api/v1';
const REQUEST_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 400;
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

/** A 401 from these endpoints means bad credentials/token, not an expired session. */
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

let refreshInFlight: Promise<string | null> | null = null;

/** Local sign-out, everywhere at once. The cart copy goes too: it mirrors this account's server cart. */
export function endLocalSession(): void {
  clearSession();
  saveCartItems([]);
  eventBus.emit('auth:logout');
  eventBus.emit('cart:changed', { count: 0 });
}

async function requestNewAccessToken(baseUrl: string): Promise<string | null> {
  try {
    const response = await axios.post<{ data?: { accessToken?: string } }>(`${baseUrl}/auth/refresh`, undefined, {
      timeout: REQUEST_TIMEOUT_MS,
      withCredentials: true,
    });
    const accessToken = response.data.data?.accessToken;
    if (!accessToken) return null;
    storeAccessToken(accessToken);
    return accessToken;
  } catch {
    return null;
  }
}

/**
 * Get a new access token with the refresh cookie (HttpOnly: JavaScript never sees it). Uses a bare
 * axios request so the interceptor stack (and its 401 handling) cannot recurse.
 *
 * Single-flight across tabs, not only in this one: the backend rotates the refresh token on every use
 * and treats a reused one as theft, ending the whole session. Two tabs refreshing together would sign
 * the user out, so they queue on a Web Lock, and a tab that waited uses the token the other one got.
 */
function refreshAccessToken(baseUrl: string, expiredToken: string | null): Promise<string | null> {
  refreshInFlight ??= (async () => {
    try {
      const refresh = () => {
        const current = getAuthToken();
        return current && current !== expiredToken ? Promise.resolve(current) : requestNewAccessToken(baseUrl);
      };
      return await (navigator.locks ? navigator.locks.request('ecom.auth.refresh', refresh) : refresh());
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

type TrackableConfig = {
  method?: string;
  baseURL?: string;
  url?: string;
  skipTracking?: boolean;
  metadata?: { startedAt: number; correlationId: string };
};

function trackRequest(config: TrackableConfig, status: number, failed: boolean): void {
  if (config.skipTracking) return;
  const startedAt = config.metadata?.startedAt;
  eventBus.emit('analytics:track', {
    name: failed ? 'api_request_failed' : 'api_request',
    source: 'http-client',
    payload: {
      method: (config.method ?? 'get').toUpperCase(),
      url: `${config.baseURL ?? ''}${config.url ?? ''}`,
      status,
      durationMs: startedAt === undefined ? undefined : Math.round(performance.now() - startedAt),
      correlationId: config.metadata?.correlationId,
    },
  });
}

/** Wire the shared interceptor stack onto any axios instance. */
export function attachInterceptors(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    const correlationId = crypto.randomUUID();
    config.headers.set('X-Request-Id', correlationId);
    config.metadata = { startedAt: performance.now(), correlationId };

    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      trackRequest(response.config, response.status, false);
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config;
      const status = error.response?.status ?? 0;

      // Transient failure on an idempotent request: retry exactly once.
      const isIdempotent = (config?.method ?? 'get').toLowerCase() === 'get';
      const isTransient = status === 0 || RETRYABLE_STATUS.has(status);
      if (config && isIdempotent && isTransient && !config.retried) {
        config.retried = true;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return instance.request(config);
      }

      // Expired access token on an authenticated call: refresh + replay once.
      const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => config?.url?.includes(path));
      if (status === 401 && config && !isAuthEndpoint) {
        if (!config.authRetried) {
          const expired = String(config.headers.get('Authorization') ?? '').replace('Bearer ', '');
          const newToken = await refreshAccessToken(config.baseURL ?? API_BASE_URL, expired || null);
          if (newToken !== null) {
            config.authRetried = true;
            return instance.request(config);
          }
        }
        // Refresh impossible/failed: reset shared auth state everywhere at once.
        endLocalSession();
      }

      if (config) {
        trackRequest(config, status, true);
      }

      throw new ApiError(
        status,
        error.response?.statusText ?? error.code ?? 'Network Error',
        error.response?.data ?? null,
      );
    },
  );

  return instance;
}

export interface HttpClientOptions {
  /** Backend base URL; override per environment. */
  baseUrl?: string;
  timeoutMs?: number;
}

/** Create an axios instance pre-wired with the shared interceptor stack. */
export function createHttpClient({
  baseUrl = API_BASE_URL,
  timeoutMs = REQUEST_TIMEOUT_MS,
}: HttpClientOptions = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: timeoutMs,
    // The refresh cookie is scoped to /api/v1/auth and only travels on credentialed requests.
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return attachInterceptors(instance);
}

/** The default client for the backend. Typed functions for every endpoint: backend-api.ts. */
export const http = createHttpClient();
