/**
 * GET /api/email/campaigns — List email campaigns
 * POST /api/email/campaigns — Create a new campaign
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { createCampaign, listCampaigns } from '@/lib/f11/email-service';
import { createCampaignSchema } from '@/lib/validations/email';

export async function GET(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('email.view_analytics');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;
  const { searchParams } = new URL(request.url);
  const campaigns = await listCampaigns(workspaceId, {
    status: searchParams.get('status') ?? undefined,
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('email.create_campaigns');
  if (isAuthError(authResult)) return authResult;

  const { userId, workspaceId } = authResult;
  const body = await request.json();
  const parsed = createCampaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const campaignId = await createCampaign(workspaceId, parsed.data, userId);
  return NextResponse.json({ campaignId });
}
