/**
 * Platform Algorithm Alerts API
 * GET: List alerts (with filters)
 * POST: Seed mock alerts (dev) or update preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listAlerts, markAlertRead, dismissAlert, seedMockAlerts, getAlertPreferences, updateAlertPreferences } from '@/lib/platform-alerts/alerts-service';
import { z } from 'zod';

const prefsSchema = z.object({
  emailDigest: z.enum(['off', 'daily', 'weekly']).optional(),
  enabledPlatforms: z.array(z.string()).optional(),
  enabledCategories: z.array(z.string()).optional(),
  minSeverity: z.enum(['critical', 'important', 'informational']).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;

  const type = req.nextUrl.searchParams.get('type');
  if (type === 'preferences') {
    return NextResponse.json(await getAlertPreferences(auth.workspaceId));
  }

  const platform = req.nextUrl.searchParams.get('platform') ?? undefined;
  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  const severity = req.nextUrl.searchParams.get('severity') ?? undefined;
  return NextResponse.json({ alerts: await listAlerts(auth.workspaceId, { platform, status, severity }) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;

  const body = await req.json();

  if (body.action === 'seed') {
    const count = await seedMockAlerts(auth.workspaceId);
    return NextResponse.json({ seeded: count });
  }
  if (body.action === 'read' && body.alertId) {
    await markAlertRead(auth.workspaceId, body.alertId);
    return NextResponse.json({ success: true });
  }
  if (body.action === 'dismiss' && body.alertId) {
    await dismissAlert(auth.workspaceId, body.alertId);
    return NextResponse.json({ success: true });
  }
  if (body.action === 'update_preferences') {
    const parsed = prefsSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    await updateAlertPreferences(auth.workspaceId, parsed.data);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
