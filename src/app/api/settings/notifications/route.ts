/**
 * GET /api/settings/notifications — Get notification settings
 * PATCH /api/settings/notifications — Update notification settings (admin+)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { updateNotificationSettingsSchema } from '@/lib/validations/entity-profile';

export async function GET() {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;

  const doc = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('settings')
    .doc('notifications')
    .get();

  return NextResponse.json({ settings: doc.exists ? doc.data() : null });
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('workspace.update_settings');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = updateNotificationSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('settings')
    .doc('notifications')
    .set(
      {
        workspaceId,
        ...parsed.data,
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: userId,
      },
      { merge: true },
    );

  return NextResponse.json({ success: true });
}
