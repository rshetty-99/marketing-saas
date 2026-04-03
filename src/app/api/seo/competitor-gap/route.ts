/**
 * POST /api/seo/competitor-gap — Analyze competitor URLs and return gap keywords
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { mockKeywordResearch, saveSEOReport } from '@/lib/f10/seo-service';
import { z } from 'zod';

const schema = z.object({
  competitorUrls: z.array(z.string().url()).min(1).max(10),
  focusKeyword: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('seo.run_research');
  if (isAuthError(authResult)) return authResult;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // In production: scrape competitor pages and analyze with Claude for gap keywords
  // For dev: mock gap analysis
  const mockGapKeywords = parsed.data.competitorUrls.flatMap((url) => {
    const domain = new URL(url).hostname.replace('www.', '');
    return mockKeywordResearch([
      `${domain} topic 1`,
      `${domain} topic 2`,
      `${domain} topic 3`,
    ]);
  });

  const reportId = await saveSEOReport(authResult.workspaceId, {
    type: 'competitor_gap',
    competitorUrls: parsed.data.competitorUrls,
    gapKeywords: mockGapKeywords,
  }, authResult.userId);

  return NextResponse.json({ reportId, gapKeywords: mockGapKeywords });
}
