import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listABTests, createABTest } from '@/lib/marketing/ab-testing-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  testType: z.enum(['email_subject', 'email_content', 'social_copy', 'social_media', 'landing_page', 'cta']),
  targetMetric: z.enum(['open_rate', 'click_rate', 'conversion_rate', 'engagement_rate']),
  resourceId: z.string().optional(),
  variants: z.array(z.object({ id: z.string(), label: z.string(), content: z.record(z.string(), z.unknown()) })).min(2).max(5),
  trafficSplit: z.array(z.number()).optional(),
});

export async function GET() {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  return NextResponse.json({ tests: await listABTests(auth.workspaceId) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createABTest(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
