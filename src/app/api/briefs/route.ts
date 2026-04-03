/**
 * Content Brief API
 * GET: List briefs
 * POST: Create brief
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listBriefs, createBrief, assignBrief } from '@/lib/platform/content-brief-service';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(300),
  objective: z.string().optional(),
  targetAudience: z.string().optional(),
  platform: z.string().optional(),
  contentType: z.string().optional(),
  toneOfVoice: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  dueDate: z.string().optional(),
  wordCountTarget: z.number().optional(),
  clientId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;
  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  return NextResponse.json({ briefs: await listBriefs(auth.workspaceId, status) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();

  if (body.action === 'assign' && body.briefId && body.assignedTo) {
    await assignBrief(auth.workspaceId, body.briefId, body.assignedTo);
    return NextResponse.json({ success: true });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createBrief(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
