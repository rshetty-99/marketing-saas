import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { listInfluencers, createInfluencer, listInfluencerCampaigns, createInfluencerCampaign } from '@/lib/marketing/influencer-service';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1),
  handle: z.string().min(1),
  platform: z.string(),
  followerCount: z.number().min(0).optional(),
  engagementRate: z.number().min(0).optional(),
  niche: z.array(z.string()).optional(),
  contactEmail: z.string().email().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.view');
  if (isAuthError(auth)) return auth;
  const type = req.nextUrl.searchParams.get('type');
  if (type === 'campaigns') return NextResponse.json({ campaigns: await listInfluencerCampaigns(auth.workspaceId) });
  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  return NextResponse.json({ influencers: await listInfluencers(auth.workspaceId, status) });
}

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth('content.create_edit_drafts');
  if (isAuthError(auth)) return auth;
  const body = await req.json();
  if (body.type === 'campaign') {
    const id = await createInfluencerCampaign(auth.workspaceId, body, auth.userId);
    return NextResponse.json({ id }, { status: 201 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const id = await createInfluencer(auth.workspaceId, parsed.data, auth.userId);
  return NextResponse.json({ id }, { status: 201 });
}
