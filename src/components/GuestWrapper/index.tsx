import { redirect } from 'next/navigation';
import { getAuthCookie } from '@/lib/cookies';

export default async function GuestWrapper({ children }: { children: React.ReactNode }) {
  const token = await getAuthCookie();
  if (token) redirect('/tickets');
  return <>{children}</>;
}
