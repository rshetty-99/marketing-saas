/**
 * Shared API route helper for workspace-scoped endpoints.
 * Validates auth, workspace membership, and permissions in one call.
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getCurrentWorkspaceMember } from '@/lib/f0/role-check';
import { hasPermission } from '@/lib/rbac';
import type { WorkspaceMember } from '@/types/features/f0';

interface AuthResult {
  userId: string;
  member: WorkspaceMember;
  workspaceId: string;
}

/**
 * Authenticate and authorize the current user for a workspace API route.
 * Returns the userId, member record, and workspaceId if authorized.
 * Returns a NextResponse error if not.
 */
export async function requireWorkspaceAuth(
  requiredPermission?: string,
): Promise<AuthResult | NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getCurrentWorkspaceMember(userId).catch(() => null);
  if (!result) {
    return NextResponse.json({ error: 'Not a workspace member' }, { status: 403 });
  }

  if (requiredPermission) {
    const allowed = await hasPermission('workspace', result.member.role, requiredPermission);
    if (!allowed) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
  }

  return {
    userId,
    member: result.member,
    workspaceId: result.workspaceId,
  };
}

/**
 * Authenticate for a specific workspaceId (from URL params).
 */
export async function requireWorkspaceAuthForId(
  workspaceId: string,
  requiredPermission?: string,
): Promise<AuthResult | NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getCurrentWorkspaceMember(userId, workspaceId).catch(() => null);
  if (!result) {
    return NextResponse.json({ error: 'Not a member of this workspace' }, { status: 403 });
  }

  if (requiredPermission) {
    const allowed = await hasPermission('workspace', result.member.role, requiredPermission);
    if (!allowed) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
  }

  return {
    userId,
    member: result.member,
    workspaceId: result.workspaceId,
  };
}

export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
