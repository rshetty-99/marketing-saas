import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listAudits, runAudit } from '@/lib/marketing-ai/website-auditor';
import { z } from 'zod';

const schema = z.object({ url: z.string().url() });

export async function GET() {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ audits: await listAudits(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = await runAudit(auth.workspaceId, parsed.data.url, auth.userId);
  return NextResponse.json(result, { status: 201 });
}
