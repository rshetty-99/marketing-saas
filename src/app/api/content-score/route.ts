import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { scoreContent, getContentScore } from '@/lib/marketing/content-scoring-service';
import { z } from 'zod';

const scoreSchema = z.object({
  contentDraftId: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;
  const draftId = req.nextUrl.searchParams.get('draftId');
  if (!draftId) return NextResponse.json({ error: 'draftId required' }, { status: 400 });
  const score = await getContentScore(auth.workspaceId, draftId);
  return NextResponse.json({ score });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = scoreSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const score = await scoreContent(auth.workspaceId, parsed.data.contentDraftId, parsed.data.title, parsed.data.content);
  return NextResponse.json({ score });
}
