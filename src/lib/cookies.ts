import { cookies } from 'next/headers';

const COOKIE_NAME = 'token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  path: '/',
  sameSite: 'strict' as const,
};

export async function setAuthCookie(token: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function getAuthCookie(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function removeAuthCookie(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
