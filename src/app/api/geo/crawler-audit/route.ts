/**
 * POST /api/geo/crawler-audit — Audit AI crawler access for a URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { auditAICrawlerAccess } from '@/lib/geo/geo-service';
import { z } from 'zod';

const schema = z.object({ url: z.string().url() });

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('seo.view_reports');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = await auditAICrawlerAccess(auth.workspaceId, parsed.data.url, auth.userId);
  return NextResponse.json(result, { status: 201 });
}
