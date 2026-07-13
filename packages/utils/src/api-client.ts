import { getAuthToken } from './auth-session';

/**
 * Minimal fetch wrapper shared by all MFEs.
 *
 * Each MFE owns its own API calls; this only standardizes base-URL handling,
 * JSON parsing, auth headers, and error shape.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    super(`API request failed: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => string | null;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export function createApiClient({ baseUrl, getToken = getAuthToken }: ApiClientOptions) {
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, headers, ...rest } = options;
    const token = getToken();

    const response = await fetch(`${baseUrl}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const payload = response.status === 204 ? null : await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, payload);
    }
    return payload as T;
  }

  return {
    get: <T>(path: string, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'PUT', body }),
    delete: <T>(path: string, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'DELETE' }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
