import AuthWrapper from '@/components/AuthWrapper';

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return <AuthWrapper>{children}</AuthWrapper>;
}
