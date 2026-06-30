import 'server-only';

import { getAuthCookie } from '@/lib/cookies';
import type { UserRole } from '@/types/auth';

export interface AuthRoleCheck {
  readonly isAdmin: boolean;
  readonly role: UserRole | null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    const payload: unknown = JSON.parse(json);

    return typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function parseRole(payload: Record<string, unknown> | null): UserRole | null {
  if (payload?.role === 'ADMIN' || payload?.role === 'AGENT') {
    return payload.role;
  }

  return null;
}

export async function getAuthRoleFromCookie(): Promise<AuthRoleCheck> {
  const token = await getAuthCookie();

  if (!token) {
    return { isAdmin: false, role: null };
  }

  const role = parseRole(decodeJwtPayload(token));

  return {
    isAdmin: role === 'ADMIN',
    role,
  };
}
