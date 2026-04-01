import { auth } from '@clerk/nextjs/server';
import { adminDb } from '@/lib/firebase/admin';
import { ROLE_HIERARCHY, type WorkspaceRole } from '@/types/roles';
import { workspaceMemberConverter } from '@/lib/firebase/converters/workspace';
import { AuthError } from './errors';

export async function requireMinRole(workspaceId: string, minRole: WorkspaceRole) {
  const { userId } = await auth();
  if (!userId) throw new AuthError('Unauthenticated');

  const memberDoc = await adminDb
    .collection('workspaces').doc(workspaceId)
    .collection('members').doc(userId)
    .withConverter(workspaceMemberConverter)
    .get();

  const member = memberDoc.data();
  if (!member || member.status !== 'active') {
    throw new AuthError('Not a workspace member', 403);
  }

  if (ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY[minRole]) {
    throw new AuthError(`Requires ${minRole} role or higher`, 403);
  }

  return member;
}
