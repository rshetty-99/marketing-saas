/**
 * POST /api/seo/score — Analyze content and return SEO score + suggestions
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { scoreOnPageSEO, saveSEOReport } from '@/lib/f10/seo-service';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  focusKeyword: z.string().min(1),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  contentDraftId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('seo.run_research');
  if (isAuthError(authResult)) return authResult;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, content, focusKeyword, metaTitle, metaDescription, contentDraftId } = parsed.data;
  const onPageScore = scoreOnPageSEO(content, title, focusKeyword, metaTitle, metaDescription);

  const reportId = await saveSEOReport(authResult.workspaceId, {
    type: 'on_page_audit',
    contentDraftId,
    targetKeyword: focusKeyword,
    onPageScore,
  }, authResult.userId);

  return NextResponse.json({ reportId, score: onPageScore });
}
