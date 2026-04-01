/**
 * POST /api/brand/test-voice — Generate voice system prompt for test drive
 * Returns the system prompt that would be used with an LLM to generate content
 * matching the configured brand voice.
 */

import { NextResponse } from 'next/server';
import { requireWorkspaceAuth, isAuthError } from '@/lib/api/workspace-auth';
import { getBrandProfile, buildVoiceSystemPrompt } from '@/lib/f8/brand-service';

export async function POST() {
  const authResult = await requireWorkspaceAuth('brand.view_profile');
  if (isAuthError(authResult)) return authResult;

  const { workspaceId } = authResult;

  const brand = await getBrandProfile(workspaceId);
  if (!brand?.brandVoice) {
    return NextResponse.json(
      { error: 'No brand voice profile configured.' },
      { status: 404 },
    );
  }

  const systemPrompt = buildVoiceSystemPrompt(brand.brandVoice);

  return NextResponse.json({
    systemPrompt,
    voiceSummary: {
      personalityTraits: brand.brandVoice.personalityTraits,
      formalityLevel: brand.brandVoice.formalityLevel,
      toneDescriptors: brand.brandVoice.toneDescriptors,
      emojiPolicy: brand.brandVoice.emojiPolicy,
    },
  });
}
