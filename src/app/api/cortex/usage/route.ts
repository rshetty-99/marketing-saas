/**
 * Cortex Usage API — Phase 11D
 * GET: Usage summary + per-user breakdown
 * POST: Set per-user limits, export CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getUsageSummary, setUserDailyLimit, exportUsageCSV } from '@/lib/cortex/usage-service';

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;

  const format = req.nextUrl.searchParams.get('format');
  if (format === 'csv') {
    const csv = await exportUsageCSV(auth.workspaceId);
    return new Response(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=cortex-usage.csv' },
    });
  }

  const days = Number(req.nextUrl.searchParams.get('days') ?? '30');
  const summary = await getUsageSummary(auth.workspaceId, days);
  return NextResponse.json(summary);
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('workspace.update_settings');
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  if (body.action === 'set_user_limit' && body.userId && body.dailyLimit !== undefined) {
    await setUserDailyLimit(auth.workspaceId, body.userId, body.dailyLimit);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
