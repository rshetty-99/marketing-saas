/**
 * GET /api/analytics — Get analytics dashboard metrics
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getDashboardMetrics } from '@/lib/f5/analytics-service';

export async function GET(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const { searchParams } = new URL(request.url);

  const metrics = await getDashboardMetrics(
    workspaceId,
    searchParams.get('dateRange') ?? 'last_30_days',
    searchParams.get('platform') ?? undefined,
    searchParams.get('clientId') ?? undefined,
  );

  return NextResponse.json(metrics);
}
