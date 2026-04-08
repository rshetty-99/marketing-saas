/**
 * POST /api/autoresearch/score — Score content without improving
 * Returns composite score + individual scorer breakdowns.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { scoreContent } from '@/lib/autoresearch';
import { z } from 'zod';

const schema = z.object({
  useCase: z.string().min(1),
  content: z.string().min(1),
  platform: z.string().optional(),
  targetKeyword: z.string().optional(),
  title: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireWorkspaceAuth();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Load brand voice from entity profile
  const { adminDb } = await import('@/lib/firebase/admin');
  const profileDoc = await adminDb.collection('entity_profiles').doc(auth.workspaceId).get();
  const brandVoice = profileDoc.exists ? (profileDoc.data()?.brandVoice as Record<string, unknown>) ?? undefined : undefined;

  const result = await scoreContent(parsed.data.useCase, parsed.data.content, {
    workspaceId: auth.workspaceId,
    brandVoice: brandVoice as never,
    platform: parsed.data.platform,
    targetKeyword: parsed.data.targetKeyword,
    title: parsed.data.title,
  });

  return NextResponse.json(result);
}
