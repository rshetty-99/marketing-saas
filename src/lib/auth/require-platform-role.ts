import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { PLATFORM_ROLE_HIERARCHY, type PlatformRole } from '@/types/roles';
import { platformUserConverter } from '@/lib/firebase/converters/workspace';
import { AuthError } from './errors';

export async function requireMinPlatformRole(minRole: PlatformRole) {
  const { userId } = await auth();
  if (!userId) throw new AuthError('Unauthenticated');

  const userDoc = await adminDb
    .collection('platform_users').doc(userId)
    .withConverter(platformUserConverter)
    .get();

  const platformUser = userDoc.data();
  if (!platformUser || platformUser.status !== 'active') {
    throw new AuthError('Not a platform user', 403);
  }

  if (PLATFORM_ROLE_HIERARCHY[platformUser.role] < PLATFORM_ROLE_HIERARCHY[minRole]) {
    throw new AuthError(`Requires ${minRole} platform role or higher`, 403);
  }

  return platformUser;
}
