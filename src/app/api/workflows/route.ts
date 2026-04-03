import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listVisualWorkflows, createVisualWorkflow } from '@/lib/marketing/visual-workflow-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  triggerType: z.enum(['form_submit', 'lead_created', 'tag_added', 'date_trigger', 'webhook', 'manual']),
  nodes: z.array(z.record(z.string(), z.unknown())).optional(),
  edges: z.array(z.record(z.string(), z.unknown())).optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('automation.view');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ workflows: await listVisualWorkflows(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('automation.manage');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createVisualWorkflow(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
