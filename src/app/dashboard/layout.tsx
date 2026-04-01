import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { getOnboardingState } from '@/lib/f0/onboarding';
import { adminDb } from '@/lib/firebase/admin';
import { getPermissions } from '@/lib/rbac';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
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
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
