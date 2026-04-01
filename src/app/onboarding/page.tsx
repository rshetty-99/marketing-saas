import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { getOnboardingState } from '@/lib/f0/onboarding';

const STEP_ROUTES: Record<number, string> = {
  1: '/onboarding/account-type',
  2: '/onboarding/workspace',
  3: '/onboarding/brand',
  4: '/onboarding/team',
  5: '/onboarding/client',
  6: '/onboarding/complete',
};

export default async function OnboardingIndexPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Find user's workspace to read onboarding state
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);

  if (!result) {
    redirect('/onboarding/account-type');
  }

  try {
    const state = await getOnboardingState(result.workspaceId);

    if (state.completed) {
      redirect('/dashboard');
    }

    const route = STEP_ROUTES[state.step];
    if (route) {
      redirect(route);
    }

    // Fallback if step is out of range
    redirect('/onboarding/account-type');
  } catch {
    redirect('/onboarding/account-type');
  }
}
