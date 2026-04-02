/**
 * DELETE /api/social/connections/[id] — Disconnect a social account
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { disconnectAccount } from '@/lib/f9/social-service';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('social.disconnect');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;
  const { id } = await params;

  await disconnectAccount(workspaceId, id, userId);

  return NextResponse.json({ success: true });
}
