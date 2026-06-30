import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
// tmsFetch is a Server Action — Next.js serialises the call across the server boundary.
import { tmsFetch } from '@/lib/tms-fetch';
import type { TmsFetchMethod } from '@/lib/tms-fetch';

export interface TmsBaseQueryArgs {
  readonly url: string;
  readonly method?: TmsFetchMethod;
  readonly body?: unknown;
  readonly params?: Record<string, unknown>;
  readonly headers?: Record<string, string>;
  readonly skipAuth?: boolean;
}

export interface TmsBaseQueryError {
  readonly status: number;
  readonly data: string;
}

const tmsBaseQuery: BaseQueryFn<TmsBaseQueryArgs, unknown, TmsBaseQueryError> = async ({
  url,
  method,
  body,
  params,
  headers,
  skipAuth,
}) => {
  const result = await tmsFetch(url, { method, body, params, headers, skipAuth });

  if (result.error) {
    return {
      error: {
        status: result.error.status,
        data: result.error.message,
      },
    };
  }

  return { data: result.data };
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: tmsBaseQuery,
  tagTypes: ['Ticket', 'Comment'],
  endpoints: () => ({}),
});
