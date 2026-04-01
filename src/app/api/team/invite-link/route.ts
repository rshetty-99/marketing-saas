/**
 * POST /api/team/invite-link — Create shareable invite link (admin+)
 * GET /api/team/invite-link — List active invite links
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { createInviteLink } from '@/lib/f7/team-management';
import { createInviteLinkSchema } from '@/lib/validations/entity-profile';
import { adminDb } from '@/lib/firebase/admin';
import type { WorkspaceRole } from '@/types/roles';

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('workspace.invite_members');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = createInviteLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await createInviteLink(
    workspaceId,
    parsed.data.role as WorkspaceRole,
    userId,
    parsed.data.maxUses,
    parsed.data.expiresInDays,
  );

  return NextResponse.json(result);
}

export async function GET() {
  const authResult = await requireWorkspaceAuth('workspace.invite_members');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;

  const linksSnap = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('invite_links')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();

  const links = linksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json({ links });
}
