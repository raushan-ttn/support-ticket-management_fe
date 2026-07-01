import { cookies } from 'next/headers';

const COOKIE_NAME = 'authToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  sameSite: 'strict' as const,
  maxAge: 60 * 60, // 1 hour — explicit expiry, not session-based
  priority: 'high' as const,
};

export async function setAuthCookie(token: string): Promise<void> {
  if (typeof token !== 'string' || token.length === 0) {
    return;
  }
  (await cookies()).set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function getAuthCookie(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function removeAuthCookie(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
