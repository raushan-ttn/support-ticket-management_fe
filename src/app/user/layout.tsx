import AuthWrapper from '@/components/AuthWrapper';
import DashboardWrapper from '@/components/DashboardWrapper';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <DashboardWrapper>{children}</DashboardWrapper>
    </AuthWrapper>
  );
}
