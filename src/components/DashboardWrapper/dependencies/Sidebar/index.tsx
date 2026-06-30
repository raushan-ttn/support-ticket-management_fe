'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logoutAction } from '@/actions/auth-actions';
import {
  HomeIcon,
  LogoutIcon,
  ProfileIcon,
  TicketIcon,
  TtnLogoIcon,
  type IconProps,
} from '@/components/common/globalSvg';
import { clearCredentials } from '@/lib/store/authSlice';
import type { AppDispatch } from '@/lib/store';
import type { UserRole } from '@/types/auth';
import { getSidebarNavForRole, type NavIconKey, type NavItemConfig } from '@/types/sidebar-nav';
import styles from './sidebar.module.scss';

interface SidebarProps {
  readonly role: UserRole;
}

const ICON_MAP: Record<NavIconKey, React.ComponentType<IconProps>> = {
  home: HomeIcon,
  profile: ProfileIcon,
  ticket: TicketIcon,
  logout: LogoutIcon,
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavItemContentProps {
  readonly item: NavItemConfig;
  readonly isItemActive: boolean;
}

function NavItemContent({ item, isItemActive }: NavItemContentProps) {
  const Icon = ICON_MAP[item.icon];
  const className = [
    styles.navItem,
    item.href ? styles.navItemLink : styles.navItemDisabled,
    isItemActive ? styles.navItemActive : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className={styles.navIcon}>
        <Icon />
      </span>
      <span className={styles.navLabel}>{item.label}</span>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className} aria-current={isItemActive ? 'page' : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <span className={className} aria-disabled="true">
      {content}
    </span>
  );
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const config = getSidebarNavForRole(role);
  const LogoutIconComponent = ICON_MAP[config.logout.icon];

  async function handleLogout() {
    try {
      await logoutAction();
      dispatch(clearCredentials());
      router.push('/');
      router.refresh();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Sidebar] Logout failed:', err);
      }
    }
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <TtnLogoIcon className={styles.logoIcon} width={32} height={32} />
        <span className={styles.logoText}>{config.brandName}</span>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        {config.navItems.map((item) => (
          <NavItemContent
            key={item.id}
            item={item}
            isItemActive={item.href ? isActive(pathname, item.href) : false}
          />
        ))}
      </nav>

      <div className={styles.logoutWrapper}>
        <button
          type="button"
          className={`${styles.navItem} ${styles.navItemLink} ${styles.logoutButton}`}
          onClick={handleLogout}
        >
          <span className={styles.navIcon}>
            <LogoutIconComponent />
          </span>
          <span className={styles.navLabel}>{config.logout.label}</span>
        </button>
      </div>

      <div className={styles.footer}>{config.footer}</div>
    </aside>
  );
}
