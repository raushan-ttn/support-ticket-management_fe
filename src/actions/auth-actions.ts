'use server';

import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { setAuthCookie, removeAuthCookie } from '@/lib/cookies';
import {
  loginSchema,
  type LoginPayload,
  type LoginActionState,
  type LoginResponse,
} from '@/types/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

export async function loginAction(payload: LoginPayload): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 429) {
    return { success: false, error: 'Too many login attempts. Please try again later.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.message ?? 'Invalid credentials' };
  }

  const json = await res.json();
  const data = json.data as LoginResponse;
  await setAuthCookie(data.token);
  return { success: true, user: data.user };
}

export async function logoutAction(): Promise<void> {
  await removeAuthCookie();
}
