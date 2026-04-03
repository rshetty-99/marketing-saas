/**
 * GET /api/dam/assets/[id]/base64 — Return asset as base64 for AI image generation injection
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('dam.view_download');
  if (isAuthError(authResult)) return authResult;

  const { id } = await params;
  const ref = adminDb.collection('workspaces').doc(authResult.workspaceId).collection('dam_assets').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

  const data = doc.data()!;

  // In production: fetch from Firebase Storage and encode
  // const file = getStorage().bucket().file(data.storagePath);
  // const [buffer] = await file.download();
  // const base64 = buffer.toString('base64');

  // For dev: return mock base64 placeholder
  const mockBase64 = Buffer.from(`mock-asset-${id}-${data.name ?? 'unknown'}`).toString('base64');

  return NextResponse.json({
    assetId: id,
    name: data.name,
    mimeType: data.mimeType,
    base64: mockBase64,
    fileSizeBytes: data.fileSizeBytes,
  });
}
