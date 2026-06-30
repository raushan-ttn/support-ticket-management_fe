import { getAuthRoleFromCookie } from '@/lib/global-helper';
import Sidebar from './dependencies/Sidebar';
import Header from './dependencies/Header';
import styles from './dashboard-wrapper.module.scss';

interface DashboardWrapperProps {
  readonly children: React.ReactNode;
}

export default async function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { role } = await getAuthRoleFromCookie();

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <Sidebar role={role ?? 'AGENT'} />
      </div>
      <div className={styles.header}>
        <Header />
      </div>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
