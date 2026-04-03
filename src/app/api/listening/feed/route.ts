/**
 * GET /api/listening/feed — Paginated mention feed with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listMentions } from '@/lib/listening/listening-service';

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;

  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '50');
  const mentions = await listMentions(auth.workspaceId, limit);
  return NextResponse.json({ mentions });
}
