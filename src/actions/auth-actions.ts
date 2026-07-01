'use server';

import { removeAuthCookie, setAuthCookie } from '@/lib/cookies';

export async function setAuthCookieAction(token: string): Promise<void> {
  if (typeof token !== 'string' || token.length === 0) {
    return;
  }
  await setAuthCookie(token);
}

export async function logoutAction(): Promise<void> {
  await removeAuthCookie();
}
