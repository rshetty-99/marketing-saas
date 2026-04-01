/**
 * PATCH /api/team/members/[userId] — Update member role or profile (admin+)
 * DELETE /api/team/members/[userId] — Deactivate member (admin+)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { updateMemberRole, deactivateMember } from '@/lib/f7/team-management';
import { updateMemberRoleSchema, deactivateMemberSchema, adminUpdateMemberSchema } from '@/lib/validations/entity-profile';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { WorkspaceRole } from '@/types/roles';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const authResult = await requireWorkspaceAuth('workspace.assign_roles');
  if (isAuthError(authResult)) return authResult;

  const { userId: actorId, member, workspaceId } = authResult;
  const { userId: targetUserId } = await params;

  const body = await request.json();

  // Check if this is a role change or a profile update
  if (body.role) {
    const parsed = updateMemberRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    await updateMemberRole(
      workspaceId,
      targetUserId,
      parsed.data.role as WorkspaceRole,
      actorId,
      member.role,
    );

    return NextResponse.json({ success: true });
  }

  // Admin profile update
  const parsed = adminUpdateMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(targetUserId)
    .update({
      ...parsed.data,
      updatedAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const authResult = await requireWorkspaceAuth('workspace.remove_members');
  if (isAuthError(authResult)) return authResult;

  const { userId: actorId, workspaceId } = authResult;
  const { userId: targetUserId } = await params;

  const body = await request.json().catch(() => ({}));
  const parsed = deactivateMemberSchema.safeParse(body);

  await deactivateMember(
    workspaceId,
    targetUserId,
    actorId,
    parsed.success ? parsed.data.reason : undefined,
    parsed.success ? parsed.data.reassignTo : undefined,
  );

  return NextResponse.json({ success: true });
}
