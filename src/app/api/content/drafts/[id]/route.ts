/**
 * GET /api/content/drafts/[id] — Get a single draft
 * PATCH /api/content/drafts/[id] — Update a draft
 * DELETE /api/content/drafts/[id] — Archive a draft
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getDraft, updateDraft, deleteDraft } from '@/lib/f1/content-service';
import { updateDraftSchema } from '@/lib/validations/content';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('content.view_all_drafts');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const { id } = await params;

  const draft = await getDraft(workspaceId, id);
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  return NextResponse.json({ draft });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;
  const { id } = await params;

  const body = await request.json();
  const parsed = updateDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  await updateDraft(workspaceId, id, parsed.data, userId);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireWorkspaceAuth('content.delete_own_drafts');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;
  const { id } = await params;

  await deleteDraft(workspaceId, id, userId);

  return NextResponse.json({ success: true });
}
