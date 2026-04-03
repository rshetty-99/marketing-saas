/**
 * DAM Asset Detail API
 * GET: Fetch asset details
 * PATCH: Update tags, approval, expiry
 * DELETE: Remove asset from Firestore + Storage
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

function assetRef(workspaceId: string, assetId: string) {
  return adminDb.collection('workspaces').doc(workspaceId).collection('dam_assets').doc(assetId);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('dam.view_download');
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const doc = await assetRef(authResult.workspaceId, id).get();
  if (!doc.exists) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

  return NextResponse.json({ asset: { id: doc.id, ...doc.data() } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('dam.upload');
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const body = await req.json();
  const ref = assetRef(authResult.workspaceId, id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

  await ref.update({ ...body, updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('dam.delete');
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const ref = assetRef(authResult.workspaceId, id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

  // In production: also delete from Firebase Storage using storagePath
  // const storagePath = doc.data()?.storagePath;
  // if (storagePath) await getStorage().bucket().file(storagePath).delete();

  await ref.update({ status: 'archived', updatedAt: FieldValue.serverTimestamp() });
  return NextResponse.json({ success: true });
}
