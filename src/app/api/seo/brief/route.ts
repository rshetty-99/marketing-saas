/**
 * POST /api/seo/brief — Generate content brief for a keyword
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { mockContentBrief, saveSEOReport } from '@/lib/f10/seo-service';
import { z } from 'zod';

const schema = z.object({
  keyword: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('seo.run_research');
  if (isAuthError(authResult)) return authResult;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const brief = mockContentBrief(parsed.data.keyword);

  const reportId = await saveSEOReport(authResult.workspaceId, {
    type: 'content_brief',
    targetKeyword: parsed.data.keyword,
    brief,
  }, authResult.userId);

  return NextResponse.json({ reportId, brief });
}
