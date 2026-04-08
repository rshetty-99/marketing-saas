import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listPlaybooks, generatePlaybook } from '@/lib/marketing-ai/launch-playbook';
import { z } from 'zod';

const schema = z.object({
  productName: z.string().min(1).max(200),
  productDescription: z.string().min(1).max(1000),
  targetAudience: z.string().min(1).max(500),
  launchDate: z.string().min(1),
  budget: z.string().min(1),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ playbooks: await listPlaybooks(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = await generatePlaybook(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json(result, { status: 201 });
}
