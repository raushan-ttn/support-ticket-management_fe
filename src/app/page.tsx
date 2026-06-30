import type { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Login — Support Ticket Management',
  description: 'Sign in to the Support Ticket Management application',
};

export default function LoginPage() {
  return <LoginForm />;
}
