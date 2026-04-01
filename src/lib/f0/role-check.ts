import { adminDb } from '@/lib/firebase/admin';
import {
  workspaceMemberConverter,
} from '@/lib/firebase/converters/workspace';
import { ROLE_HIERARCHY, type WorkspaceRole } from '@/types/roles';
import type { WorkspaceMember } from '@/types/features/f0';
import {
  hasPermission as rbacHasPermission,
  isAtLeastRole as rbacIsAtLeastRole,
  getAssignableRoles as rbacGetAssignableRoles,
  getRoleDefinition,
} from '@/lib/rbac';

/**
 * Get the current user's workspace membership.
 * If workspaceId is provided, looks up membership in that specific workspace.
 * Otherwise, returns the first active workspace membership found.
 */
export async function getCurrentWorkspaceMember(
  userId: string,
  workspaceId?: string,
): Promise<{
  member: WorkspaceMember;
  workspaceId: string;
} | null> {
  try {
    if (workspaceId) {
      const memberSnap = await adminDb
        .collection('workspaces')
        .doc(workspaceId)
        .collection('members')
        .doc(userId)
        .withConverter(workspaceMemberConverter)
        .get();

      if (!memberSnap.exists) {
        return null;
      }

      const member = memberSnap.data();
      if (!member || member.status !== 'active') {
        return null;
      }

      return { member, workspaceId };
    }

    // No workspaceId provided — search across all workspaces using a collection group query
    const membersQuery = await adminDb
      .collectionGroup('members')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (membersQuery.empty) {
      return null;
    }

    const memberDoc = membersQuery.docs[0];
    const memberData = memberDoc.data() as Omit<WorkspaceMember, 'userId'>;
    const member: WorkspaceMember = {
      userId: memberDoc.id,
      ...memberData,
    } as WorkspaceMember;

    // Extract workspaceId from the document path: workspaces/{workspaceId}/members/{userId}
    const pathSegments = memberDoc.ref.path.split('/');
    const resolvedWorkspaceId = pathSegments[1];

    return { member, workspaceId: resolvedWorkspaceId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get workspace member: ${message}`);
  }
}

/**
 * Synchronous fallback: check if a role meets minimum threshold using hardcoded hierarchy.
 * Prefer the async Firestore-backed version for new code.
 */
export function hasMinRole(userRole: WorkspaceRole, minRole: WorkspaceRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

/**
 * Firestore-backed permission check.
 * Checks the config/workspace_permissions collection.
 */
export async function checkPermission(
  role: WorkspaceRole,
  permission: string,
): Promise<boolean> {
  return rbacHasPermission('workspace', role, permission);
}

/**
 * Firestore-backed role hierarchy check.
 */
export async function checkIsAtLeastRole(
  userRole: string,
  minRole: string,
): Promise<boolean> {
  return rbacIsAtLeastRole('workspace', userRole, minRole);
}

/**
 * Get roles that the current user can assign — reads from Firestore.
 */
export async function getAssignableRolesFromFirestore(
  currentRole: string,
): Promise<Array<{ key: string; label: string; description: string }>> {
  const roles = await rbacGetAssignableRoles('workspace', currentRole);
  return roles.map((r) => ({ key: r.key, label: r.label, description: r.description }));
}

/**
 * Synchronous fallback: get assignable roles from hardcoded hierarchy.
 * @deprecated Use getAssignableRolesFromFirestore for new code.
 */
export function getAssignableRoles(currentRole: WorkspaceRole): WorkspaceRole[] {
  const currentLevel = ROLE_HIERARCHY[currentRole];
  return (Object.entries(ROLE_HIERARCHY) as [WorkspaceRole, number][])
    .filter(([, level]) => level < currentLevel && level > 10)
    .map(([role]) => role)
    .sort((a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a]);
}

/**
 * Get role display info from Firestore.
 */
export async function getRoleDisplay(
  role: string,
): Promise<{ label: string; description: string } | null> {
  const def = await getRoleDefinition('workspace', role);
  if (!def) return null;
  return { label: def.label, description: def.description };
}

/**
 * Static role display info for UI — fallback when async isn't available.
 * @deprecated Use getRoleDisplay for new code.
 */
export const ROLE_DISPLAY: Record<WorkspaceRole, { label: string; description: string }> = {
  owner: { label: 'Owner', description: 'Full control including billing and deletion' },
  admin: { label: 'Admin', description: 'Manage members, integrations, and all content' },
  manager: { label: 'Manager', description: 'Approve and publish content, assign tasks' },
  editor: { label: 'Editor', description: 'Create and edit content, submit for approval' },
  viewer: { label: 'Viewer', description: 'Read-only access to content and analytics' },
  client_portal: { label: 'Client', description: 'View reports and approved content' },
};
