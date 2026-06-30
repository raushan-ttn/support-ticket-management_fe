import { redirect } from 'next/navigation';
import { getAuthCookie } from '@/lib/cookies';

export default async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const token = await getAuthCookie();
  if (!token) redirect('/');
  return <>{children}</>;
}
