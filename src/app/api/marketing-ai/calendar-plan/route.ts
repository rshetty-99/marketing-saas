import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listCalendarPlans, generateCalendarPlan } from '@/lib/marketing-ai/calendar-generator';
import { z } from 'zod';

const schema = z.object({
  businessType: z.string().min(1).max(200),
  goals: z.array(z.string()).min(1).max(10),
  platforms: z.array(z.string()).min(1).max(8),
  postsPerWeek: z.number().min(1).max(21).default(5),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ plans: await listCalendarPlans(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = await generateCalendarPlan(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json(result, { status: 201 });
}
