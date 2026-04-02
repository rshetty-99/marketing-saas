/**
 * POST /api/images/generate — Generate image(s) with AI (mock for dev)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { generateImage } from '@/lib/f13/image-service';
import { generateImageSchema } from '@/lib/validations/images';

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('images.generate');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;
  const body = await request.json();
  const parsed = generateImageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const imageIds = await generateImage(workspaceId, parsed.data, userId);
  return NextResponse.json({ imageIds, count: imageIds.length });
}
