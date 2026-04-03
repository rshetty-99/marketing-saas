/**
 * DELETE /api/images/[id] — Delete image (Firestore + Storage)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { deleteImage } from '@/lib/f13/image-service';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireWorkspaceAuth('images.generate');
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  await deleteImage(auth.workspaceId, id, auth.userId);
  return NextResponse.json({ success: true });
}
