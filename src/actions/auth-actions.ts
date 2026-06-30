'use server';

import { removeAuthCookie, setAuthCookie } from '@/lib/cookies';

export async function setAuthCookieAction(token: string): Promise<void> {
  await setAuthCookie(token);
}

export async function logoutAction(): Promise<void> {
  await removeAuthCookie();
}
