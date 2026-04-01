/**
 * GET /api/settings/profile — Get entity profile
 * PATCH /api/settings/profile — Update entity profile (admin+)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { updateEntityProfileSchema } from '@/lib/validations/entity-profile';

export async function GET() {
  const authResult = await requireWorkspaceAuth();
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;

  const doc = await adminDb.collection('entity_profiles').doc(workspaceId).get();
  if (!doc.exists) {
    return NextResponse.json({ error: 'Entity profile not found' }, { status: 404 });
  }

  return NextResponse.json({ profile: { workspaceId: doc.id, ...doc.data() } });
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('workspace.update_settings');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;

  const body = await request.json();
  const parsed = updateEntityProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  await adminDb.collection('entity_profiles').doc(workspaceId).update({
    ...parsed.data,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
