/**
 * POST /api/geo/llms-txt — Generate llms.txt content
 * GET /api/geo/llms-txt — List GEO reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { generateLlmsTxt, listGeoReports, getMockShareOfVoice } from '@/lib/geo/geo-service';
import { z } from 'zod';

const schema = z.object({
  companyName: z.string().min(1),
  description: z.string().min(1),
  keyTopics: z.array(z.string()).min(1),
  preferredCitations: z.array(z.string()),
  brandGuidelines: z.string(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('seo.view_reports');
  if (isAuthError(auth)) return auth;
  const type = req.nextUrl.searchParams.get('type') ?? undefined;
  if (type === 'share_of_voice') {
    return NextResponse.json(getMockShareOfVoice(auth.workspaceId));
  }
  const reports = await listGeoReports(auth.workspaceId, type);
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('seo.view_reports');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const content = generateLlmsTxt(parsed.data);
  return NextResponse.json({ content });
}
