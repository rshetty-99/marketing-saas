/**
 * POST /api/settings/danger/archive — Archive workspace (owner only)
 * POST /api/settings/danger/delete — Delete workspace (owner only)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { archiveWorkspace, deleteWorkspace } from '@/lib/f7/team-management';
import { archiveWorkspaceSchema, deleteWorkspaceSchema } from '@/lib/validations/entity-profile';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('workspace.delete');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const action = body.action;

  // Verify workspace name
  const wsSnap = await adminDb.collection('workspaces').doc(workspaceId).get();
  const wsName = wsSnap.data()?.name;

  if (action === 'archive') {
    const parsed = archiveWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (parsed.data.confirmWorkspaceName !== wsName) {
      return NextResponse.json({ error: 'Workspace name does not match' }, { status: 400 });
    }
    await archiveWorkspace(workspaceId, userId);
    return NextResponse.json({ success: true, action: 'archived' });
  }

  if (action === 'delete') {
    const parsed = deleteWorkspaceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    if (parsed.data.confirmWorkspaceName !== wsName) {
      return NextResponse.json({ error: 'Workspace name does not match' }, { status: 400 });
    }
    await deleteWorkspace(workspaceId, userId);
    return NextResponse.json({ success: true, action: 'deleted' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
