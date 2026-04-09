/**
 * POST /api/geo/score — Score content for AI citability (GEO)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { scoreContent } from '@/lib/geo/geo-service';
import { z } from 'zod';

const schema = z.object({
  content: z.string().min(1),
  title: z.string().min(1),
  hasSchemaMarkup: z.boolean().optional(),
  hasFaqSection: z.boolean().optional(),
  hasLastUpdated: z.boolean().optional(),
  authorBio: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('seo.view_reports');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = await scoreContent(auth.workspaceId, parsed.data.content, parsed.data.title, {
    hasSchemaMarkup: parsed.data.hasSchemaMarkup ?? false,
    hasFaqSection: parsed.data.hasFaqSection ?? false,
    hasLastUpdated: parsed.data.hasLastUpdated ?? false,
    authorBio: parsed.data.authorBio ?? false,
  });
  return NextResponse.json(result);
}
