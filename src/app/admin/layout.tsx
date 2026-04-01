import { PlatformLoginGate } from '@/components/features/F0/admin/PlatformLoginGate';
import { AdminLayout } from '@/components/features/F0/admin/AdminLayout';
import type { ReactNode } from 'react';

interface AdminRouteLayoutProps {
  children: ReactNode;
}

export default async function AdminRouteLayout({
  children,
}: AdminRouteLayoutProps) {
  return (
    <PlatformLoginGate>
      <AdminLayout>{children}</AdminLayout>
    </PlatformLoginGate>
  );
}
