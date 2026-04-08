import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listProposals, generateProposal } from '@/lib/marketing-ai/proposal-generator';
import { z } from 'zod';

const schema = z.object({
  clientName: z.string().min(1).max(200),
  clientIndustry: z.string().min(1).max(200),
  services: z.array(z.string()).min(1).max(10),
  monthlyBudget: z.string().min(1),
  duration: z.string().min(1),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ proposals: await listProposals(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = await generateProposal(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json(result, { status: 201 });
}
