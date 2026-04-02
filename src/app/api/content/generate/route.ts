/**
 * POST /api/content/generate — Generate content with AI (mock for now)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { generateContentWithAI } from '@/lib/f1/content-service';
import { generateContentSchema } from '@/lib/validations/content';

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = generateContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const draftId = await generateContentWithAI(workspaceId, parsed.data, userId);

  return NextResponse.json({ draftId });
}
