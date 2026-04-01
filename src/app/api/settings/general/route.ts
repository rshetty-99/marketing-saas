/**
 * PATCH /api/settings/general — Update workspace general settings (admin+)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { updateWorkspaceGeneralSchema } from '@/lib/validations/entity-profile';
import { writeAuditLog } from '@/lib/f7/team-management';

export async function PATCH(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('workspace.update_settings');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = updateWorkspaceGeneralSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  await adminDb.collection('workspaces').doc(workspaceId).update({
    ...parsed.data,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await writeAuditLog(workspaceId, {
    action: 'workspace.settings_updated',
    resourceType: 'workspace',
    resourceId: workspaceId,
    actorId: userId,
    details: { updatedFields: Object.keys(parsed.data) },
  });

  return NextResponse.json({ success: true });
}
