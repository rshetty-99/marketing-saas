/**
 * POST /api/team/transfer-ownership — Transfer workspace ownership (owner only)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { transferOwnership } from '@/lib/f7/team-management';
import { transferOwnershipSchema } from '@/lib/validations/entity-profile';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('workspace.transfer_ownership');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = transferOwnershipSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  // Verify workspace name matches
  const wsSnap = await adminDb.collection('workspaces').doc(workspaceId).get();
  const wsName = wsSnap.data()?.name;
  if (parsed.data.confirmWorkspaceName !== wsName) {
    return NextResponse.json({ error: 'Workspace name does not match' }, { status: 400 });
  }

  await transferOwnership(workspaceId, userId, parsed.data.newOwnerId);

  return NextResponse.json({ success: true });
}
