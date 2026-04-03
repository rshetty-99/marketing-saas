import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listAdCampaigns, createAdCampaign } from '@/lib/marketing/ad-campaign-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  platform: z.enum(['meta', 'google', 'linkedin', 'twitter', 'tiktok', 'pinterest']),
  objective: z.enum(['awareness', 'traffic', 'engagement', 'leads', 'conversions', 'app_installs']),
  dailyBudget: z.number().min(1),
  totalBudget: z.number().min(1),
  currency: z.string().default('USD'),
  clientId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('analytics.view_dashboard');
  if (isAuthError(auth)) return auth;
  const platform = req.nextUrl.searchParams.get('platform') ?? undefined;
  return NextResponse.json({ campaigns: await listAdCampaigns(auth.workspaceId, platform) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createAdCampaign(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
