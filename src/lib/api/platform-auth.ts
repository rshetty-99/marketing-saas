/**
 * Shared auth helper for admin panel routes.
 * Validates the user is a platform team member with sufficient role.
 */

import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { hasPermission } from '@/lib/rbac';
import type { PlatformUser } from '@/types/features/f0';

interface PlatformAuthResult {
  userId: string;
  platformUser: PlatformUser;
}

export async function requirePlatformAuth(
  requiredPermission?: string,
): Promise<PlatformAuthResult | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const doc = await adminDb.collection('platform_users').doc(userId).get();
  if (!doc.exists) return null;

  const platformUser = { userId: doc.id, ...doc.data() } as PlatformUser;
  if (platformUser.status !== 'active') return null;

  if (requiredPermission) {
    const allowed = await hasPermission('platform', platformUser.role, requiredPermission);
    if (!allowed) return null;
  }

  return { userId, platformUser };
}
