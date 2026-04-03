/**
 * Custom Dashboards API
 * GET: List dashboards
 * POST: Create dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listDashboards, createDashboard, updateDashboard } from '@/lib/platform/custom-dashboard-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  clientId: z.string().optional(),
  widgets: z.array(z.record(z.string(), z.unknown())).optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ dashboards: await listDashboards(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  const body = await req.json();

  if (body.action === 'update' && body.dashboardId) {
    await updateDashboard(auth.workspaceId, body.dashboardId, body);
    return NextResponse.json({ success: true });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createDashboard(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
