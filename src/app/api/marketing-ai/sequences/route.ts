import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listSequences, generateSequence } from '@/lib/marketing-ai/email-sequence-generator';
import { z } from 'zod';

const schema = z.object({
  sequenceType: z.enum(['welcome', 'nurture', 'launch', 'onboarding', 're_engagement', 'upsell']),
  topic: z.string().min(1).max(500),
  targetAudience: z.string().min(1).max(500),
  brandName: z.string().optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('email.create_campaigns');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ sequences: await listSequences(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('email.create_campaigns');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = await generateSequence(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json(result, { status: 201 });
}
