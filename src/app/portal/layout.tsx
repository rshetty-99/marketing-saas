import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import type { ReactNode } from 'react';

interface PortalRouteLayoutProps {
  children: ReactNode;
}

export default async function PortalRouteLayout({
  children,
}: PortalRouteLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const result = await getCurrentWorkspaceMember(userId);

  if (!result || result.member.role !== 'client_portal') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center border-b border-border px-6">
        <span className="text-heading-md font-display text-brand-orange">
          Aura Portal
        </span>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
