'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCog,
  CreditCard,
  ScrollText,
  ToggleRight,
  Shield,
  Handshake,
  Settings,
  ArrowUpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/workspaces', label: 'Workspaces', icon: Building2 },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/upgrades', label: 'Upgrades', icon: ArrowUpCircle },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: ToggleRight },
  { href: '/admin/moderation', label: 'Moderation', icon: Shield },
  { href: '/admin/partnerships', label: 'Partnerships', icon: Handshake },
  { href: '/admin/team', label: 'Platform Team', icon: UserCog },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div data-testid="admin-layout" className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-6">
          <h1 className="text-heading-md font-display text-brand-orange">
            Aura Admin
          </h1>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-body-sm font-ui transition-colors',
                  isActive
                    ? 'bg-brand-orange/10 text-brand-orange'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        <div className="flex h-14 items-center border-b border-border px-6">
          <span className="text-heading-md font-display text-foreground">
            Aura Admin
          </span>
        </div>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
