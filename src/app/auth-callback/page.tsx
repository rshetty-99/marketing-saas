import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { getOnboardingState } from '@/lib/f0/onboarding';

/**
 * Post-authentication router.
 * Clerk redirects here after sign-in/sign-up.
 * Routes the user to the right place based on their state:
 *   - Platform user → /admin
 *   - client_portal role → /portal
 *   - Has workspace + onboarding complete → /dashboard
 *   - Has workspace + onboarding incomplete → /onboarding (correct step)
 *   - No workspace → /onboarding/account-type
 */
export default async function AuthCallbackPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // 1. Check if platform user → /admin
  const platformDoc = await adminDb.collection('platform_users').doc(userId).get();
  if (platformDoc.exists) {
    redirect('/admin');
  }

  // 2. Check if user has an existing workspace
  const result = await getCurrentWorkspaceMember(userId).catch(() => null);

  if (!result) {
    redirect('/onboarding/account-type');
  }

  // 3. Check if client_portal user → /portal
  if (result.member.role === 'client_portal') {
    redirect('/portal');
  }

  // 4. Check onboarding state
  const stepRoutes: Record<number, string> = {
    1: '/onboarding/account-type',
    2: '/onboarding/workspace',
    3: '/onboarding/brand',
    4: '/onboarding/team',
    5: '/onboarding/client',
    6: '/onboarding/complete',
  };

  let destination = '/dashboard';

  try {
    const state = await getOnboardingState(result.workspaceId);

    if (!state.completed) {
      destination = stepRoutes[state.step] || '/onboarding/account-type';
    }
  } catch {
    // Can't read onboarding state — default to dashboard
  }

  redirect(destination);
}
