/**
 * Funnels API
 * GET: List funnels
 * POST: Create funnel
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listFunnels, createFunnel } from '@/lib/landing-pages/landing-page-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  clientId: z.string().optional(),
  steps: z.array(z.object({
    pageId: z.string(),
    order: z.number(),
    label: z.string(),
  })).optional(),
});

export async function GET() {
  const authResult = await requireWorkspaceAuth('content.view');
  if (isAuthError(authResult)) return authResult;

  const funnels = await listFunnels(authResult.workspaceId);
  return NextResponse.json({ funnels });
}

export async function POST(req: NextRequest) {
  const authResult = await requireWorkspaceAuth('content.create');
  if (isAuthError(authResult)) return authResult;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const id = await createFunnel(authResult.workspaceId, parsed.data, authResult.userId);
  return NextResponse.json({ id }, { status: 201 });
}
