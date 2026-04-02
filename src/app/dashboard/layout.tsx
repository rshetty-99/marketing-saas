import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { getOnboardingState } from '@/lib/f0/onboarding';
import { adminDb } from '@/lib/firebase/admin';
import { getPermissions } from '@/lib/rbac';
import { checkTierAccess } from '@/lib/api/tier-gate';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SoftLockBanner } from '@/components/features/F0/SoftLockBanner';
import type { ReactNode } from 'react';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Check if this is a platform user — redirect to /admin
  const platformDoc = await adminDb.collection('platform_users').doc(userId).get();
  if (platformDoc.exists) {
    redirect('/admin');
  }

  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) redirect('/onboarding');

  // Check if client_portal user — redirect to /portal
  if (result.member.role === 'client_portal') {
    redirect('/portal');
  }

  try {
    const state = await getOnboardingState(result.workspaceId);
    if (!state.completed) redirect('/onboarding');
  } catch {
    redirect('/onboarding');
  }

  // Fetch workspace doc + permissions in parallel
  const [wsDoc, permissions] = await Promise.all([
    adminDb.collection('workspaces').doc(result.workspaceId).get(),
    getPermissions('workspace', result.member.role),
  ]);

  const wsData = wsDoc.data();
  const workspaceName = wsData?.name ?? 'Workspace';
  const accountType = wsData?.accountType ?? 'freelancer';
  const trialEndsAt = wsData?.trialEndsAt?.toDate()?.toISOString() ?? null;
  const workspaceStatus = wsData?.status ?? 'trial';

  // Tier-based feature gating
  const headersList = await headers();
  const pathname = headersList.get('x-next-pathname') ?? '';
  if (pathname && pathname !== '/dashboard') {
    const tierCheck = await checkTierAccess(result.workspaceId, pathname);
    if (!tierCheck.allowed) {
      redirect(`/dashboard/billing?upgrade=${tierCheck.upgradeTier ?? ''}&reason=${encodeURIComponent(tierCheck.reason ?? '')}`);
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          workspaceName={workspaceName}
          accountType={accountType}
          trialEndsAt={trialEndsAt ? new Date(trialEndsAt) : undefined}
          permissions={permissions}
        />
        <SidebarInset>
          {workspaceStatus === 'soft_locked' && <SoftLockBanner />}
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
