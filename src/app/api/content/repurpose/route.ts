/**
 * POST /api/content/repurpose — Repurpose content for other channels (F2)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { repurposeContent } from '@/lib/f1/content-service';
import { repurposeSchema } from '@/lib/validations/content';

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = repurposeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const draftIds = await repurposeContent(
    workspaceId,
    parsed.data.sourceDraftId,
    parsed.data.targetChannels,
    userId,
  );

  return NextResponse.json({ draftIds, count: draftIds.length });
}
