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
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await setAuthCookieAction(data.token);
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
