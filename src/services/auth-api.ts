import { setAuthCookieAction } from '@/actions/auth-actions';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { AuthUser, LoginPayload, LoginResponse } from '@/types/auth';
import { baseApi } from '@/services/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (body) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body,
        skipAuth: true,
      }),
      transformResponse: (response: unknown): LoginResponse => {
        if (!response || typeof response !== 'object') {
          return response as unknown as LoginResponse;
        }
        let candidate = response as Record<string, unknown>;
        // Peel up to two levels of { data: ... } envelope (handles backends that return
        // { data: { token, user } } even when sibling keys prevent the tmsFetch parse unwrap,
        // or double-wrapped responses).
        for (let i = 0; i < 2; i += 1) {
          const inner = candidate.data;
          if (inner && typeof inner === 'object') {
            candidate = inner as Record<string, unknown>;
          } else {
            break;
          }
        }
        return candidate as unknown as LoginResponse;
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = (data as Partial<LoginResponse> | undefined)?.token;
          if (token) {
            await setAuthCookieAction(token);
          }
        } catch {
          // Login failed — cookie is not set.
        }
      },
    }),

    getMe: builder.query<AuthUser, void>({
      query: () => ({ url: API_ENDPOINTS.AUTH.ME }),
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery, useLazyGetMeQuery } = authApi;
