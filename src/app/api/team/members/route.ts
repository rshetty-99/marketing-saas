/**
 * GET /api/team/members — List workspace members
 * POST /api/team/members — Invite new member(s)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { inviteTeamMembers } from '@/lib/f0/team-invitation';
import { bulkInviteSchema } from '@/lib/validations/entity-profile';

export async function GET() {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;

  const membersSnap = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .orderBy('createdAt', 'desc')
    .get();

  const members = membersSnap.docs.map((doc) => ({
    userId: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json({ members });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('workspace.invite_members');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = bulkInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await inviteTeamMembers(
    workspaceId,
    parsed.data.invitations,
    userId,
  );

  return NextResponse.json(result);
}
