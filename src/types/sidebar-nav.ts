import { z } from 'zod';
import sidebarNavConfig from '@/data/sidebar-nav.json';
import type { UserRole } from '@/types/auth';

export const NAV_ICON_KEYS = ['home', 'profile', 'ticket', 'logout'] as const;

export type NavIconKey = (typeof NAV_ICON_KEYS)[number];

const navIconKeySchema = z.enum(NAV_ICON_KEYS);

const navItemConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().nullable(),
  icon: navIconKeySchema,
});

const logoutConfigSchema = z.object({
  label: z.string(),
  icon: navIconKeySchema,
});

const roleNavConfigSchema = z.object({
  navItems: z.array(navItemConfigSchema),
  logout: logoutConfigSchema,
});

const sidebarNavSchema = z.object({
  brandName: z.string(),
  footer: z.string(),
  ADMIN: roleNavConfigSchema,
  AGENT: roleNavConfigSchema,
});

export type NavItemConfig = z.infer<typeof navItemConfigSchema>;
export type LogoutConfig = z.infer<typeof logoutConfigSchema>;
export type RoleNavConfig = z.infer<typeof roleNavConfigSchema>;

export interface SidebarNavForRole extends RoleNavConfig {
  readonly brandName: string;
  readonly footer: string;
}

const parsedSidebarNav = sidebarNavSchema.parse(sidebarNavConfig);

export function getSidebarNavForRole(role: UserRole): SidebarNavForRole {
  const roleConfig = parsedSidebarNav[role] ?? parsedSidebarNav.AGENT;

  return {
    brandName: parsedSidebarNav.brandName,
    footer: parsedSidebarNav.footer,
    navItems: roleConfig.navItems,
    logout: roleConfig.logout,
  };
}
