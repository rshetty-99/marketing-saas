/**
 * GET /api/seo — List SEO reports
 * POST /api/seo — Run SEO analysis on a content draft
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { scoreOnPageSEO, mockKeywordResearch, saveSEOReport, listSEOReports } from '@/lib/f10/seo-service';
import { getDraft } from '@/lib/f1/content-service';
import { scoreContentSEOSchema } from '@/lib/validations/seo';

export async function GET() {
  const authResult = await requireWorkspaceAuth('seo.view_reports');
  if (isAuthError(authResult)) return authResult;
  const reports = await listSEOReports(authResult.workspaceId);
  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('seo.run_research');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;
  const body = await request.json();
  const parsed = scoreContentSEOSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const draft = await getDraft(workspaceId, parsed.data.contentDraftId);
  if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

  const onPageScore = scoreOnPageSEO(
    draft.content as string,
    draft.title as string,
    parsed.data.focusKeyword,
    draft.seoMetaTitle as string | undefined,
    draft.seoMetaDescription as string | undefined,
  );

  const keywords = mockKeywordResearch([parsed.data.focusKeyword]);

  const reportId = await saveSEOReport(workspaceId, {
    type: 'on_page_audit',
    contentDraftId: parsed.data.contentDraftId,
    targetKeyword: parsed.data.focusKeyword,
    onPageScore,
    keywords,
  }, userId);

  return NextResponse.json({ reportId, onPageScore, keywords });
}
