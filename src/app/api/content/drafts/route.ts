/**
 * GET /api/content/drafts — List content drafts
 * POST /api/content/drafts — Create a new draft
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { createDraft, listDrafts } from '@/lib/f1/content-service';
import { createDraftSchema } from '@/lib/validations/content';

export async function GET(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('content.view_all_drafts');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const { searchParams } = new URL(request.url);

  const drafts = await listDrafts(workspaceId, {
    status: searchParams.get('status') ?? undefined,
    contentType: searchParams.get('contentType') ?? undefined,
    channel: searchParams.get('channel') ?? undefined,
    clientId: searchParams.get('clientId') ?? undefined,
    assignedTo: searchParams.get('assignedTo') ?? undefined,
    limit: parseInt(searchParams.get('limit') ?? '50', 10),
  });

  return NextResponse.json({ drafts });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;

  const body = await request.json();
  const parsed = createDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const draftId = await createDraft(workspaceId, parsed.data, userId);

  return NextResponse.json({ draftId });
}
