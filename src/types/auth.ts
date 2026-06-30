import { z } from 'zod';

export type UserRole = 'ADMIN' | 'AGENT';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'BLOCKED';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginPayload = z.infer<typeof loginSchema>;
