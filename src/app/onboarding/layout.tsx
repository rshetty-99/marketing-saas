import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { getOnboardingState } from '@/lib/f0/onboarding';
import type { ReactNode } from 'react';

interface OnboardingLayoutPageProps {
  children: ReactNode;
}

export default async function OnboardingRouteLayout({
  children,
}: OnboardingLayoutPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user already has a completed workspace
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);

  if (result) {
    try {
      const state = await getOnboardingState(result.workspaceId);
      if (state.completed) {
        redirect('/dashboard');
      }
    } catch {
      // Workspace exists but onboarding state is unavailable — continue onboarding
    }
  }

  return <>{children}</>;
}
