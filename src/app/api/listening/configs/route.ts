/**
 * GET /api/listening/configs — Get workspace listening config
 * PUT /api/listening/configs — Upsert config (keywords, platforms)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getListeningConfig, saveListeningConfig } from '@/lib/listening/listening-service';
import { z } from 'zod';

const configSchema = z.object({
  keywords: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  alertFrequency: z.enum(['realtime', 'daily', 'weekly']).optional(),
  alertEmail: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  const config = await getListeningConfig(auth.workspaceId);
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await saveListeningConfig(auth.workspaceId, parsed.data);
  return NextResponse.json({ success: true });
}
