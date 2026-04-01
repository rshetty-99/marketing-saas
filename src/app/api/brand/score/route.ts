/**
 * POST /api/brand/score — Score content against brand voice profile
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getBrandProfile, scoreBrandVoiceConsistency } from '@/lib/f8/brand-service';

const scoreRequestSchema = z.object({
  content: z.string().min(10).max(50000),
});

export async function POST(request: NextRequest) {
  const authResult = await requireWorkspaceAuth('brand.view_profile');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;

  const body = await request.json();
  const parsed = scoreRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Content is required (min 10 chars)' }, { status: 400 });
  }

  const brand = await getBrandProfile(workspaceId);
  if (!brand?.brandVoice) {
    return NextResponse.json(
      { error: 'No brand voice profile configured. Set up your brand voice first.' },
      { status: 404 },
    );
  }

  const score = scoreBrandVoiceConsistency(parsed.data.content, brand.brandVoice);

  return NextResponse.json({ score });
}
