'use server';

import { getAuthCookie } from '@/lib/cookies';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8082';

export type TmsFetchMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface TmsFetchOptions {
  readonly method?: TmsFetchMethod;
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, unknown>;
  readonly skipAuth?: boolean;
}

export interface TmsFetchError {
  readonly status: number;
  readonly message: string;
}

export interface TmsFetchResult<T> {
  readonly data?: T;
  readonly error?: TmsFetchError;
}

function buildUrl(path: string, params?: TmsFetchOptions['params']): string {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

function parseResponseBody<T>(json: unknown): T {
  if (typeof json !== 'object' || json === null) {
    return json as T;
  }

  const record = json as Record<string, unknown>;

  // Unwrap simple `{ data: T }` envelopes only (e.g. auth/me).
  // Keep paginated shapes like `{ data: [], total, page, limit }` intact.
  if ('data' in record && Object.keys(record).length === 1) {
    return record.data as T;
  }

  return json as T;
}

export async function tmsFetch<T>(
  path: string,
  opts?: TmsFetchOptions,
): Promise<TmsFetchResult<T>> {
  const { method = 'GET', body, headers = {}, params, skipAuth = false } = opts ?? {};

  const requestHeaders = new Headers(headers);

  if (!skipAuth) {
    const token = await getAuthCookie();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  let requestBody: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (isFormDataBody(body)) {
      requestBody = body;
    } else {
      requestBody = JSON.stringify(body);
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
    }
  }

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      headers: requestHeaders,
      body: requestBody,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return {
        error: {
          status: response.status,
          message: getErrorMessage(errorBody, response.statusText || 'Request failed'),
        },
      };
    }

    if (response.status === 204) {
      return { data: undefined as T };
    }

    const json: unknown = await response.json();

    return { data: parseResponseBody<T>(json) };
  } catch (error) {
    return {
      error: {
        status: 500,
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}
