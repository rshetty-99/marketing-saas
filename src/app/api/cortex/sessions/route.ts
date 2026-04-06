/**
 * GET /api/cortex/sessions — List Cortex sessions for current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listSessions } from '@/lib/cortex/cortex-service';

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth();
  if (isAuthError(auth)) return auth;

  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '20');
  const sessions = await listSessions(auth.workspaceId, auth.userId, Math.min(limit, 100));
  return NextResponse.json({ sessions });
}
