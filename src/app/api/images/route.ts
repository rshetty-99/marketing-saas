/**
 * GET /api/images — List generated images
 */

import { NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listImages } from '@/lib/f13/image-service';

export async function GET() {
  const authResult = await requireWorkspaceAuth('images.generate');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const images = await listImages(workspaceId);
  return NextResponse.json({ images });
}
