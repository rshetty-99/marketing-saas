/**
 * POST /api/dam/assets/[id]/version — Upload new version of an asset
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('dam.upload');
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const body = await req.json();

  const ref = adminDb.collection('workspaces').doc(authResult.workspaceId).collection('dam_assets').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

  const current = doc.data()!;
  const newVersionNumber = (current.currentVersionNumber ?? 1) + 1;

  // Archive current version
  const currentVersion = {
    versionId: `v${current.currentVersionNumber ?? 1}`,
    versionNumber: current.currentVersionNumber ?? 1,
    fileUrl: current.fileUrl,
    fileSizeBytes: current.fileSizeBytes,
    uploadedBy: current.createdBy,
    uploadedAt: current.updatedAt,
    changeSummary: body.changeSummary ?? null,
  };

  await ref.update({
    fileUrl: body.fileUrl,
    fileSizeBytes: body.fileSizeBytes ?? current.fileSizeBytes,
    currentVersionNumber: newVersionNumber,
    versions: FieldValue.arrayUnion(currentVersion),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true, version: newVersionNumber });
}
